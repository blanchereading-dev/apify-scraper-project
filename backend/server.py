from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str
    address: str
    city: str
    state: str = "MN"
    zip_code: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    services: List[str] = []
    latitude: float
    longitude: float
    eligibility: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResourceCreate(BaseModel):
    name: str
    category: str
    description: str
    address: str
    city: str
    state: str = "MN"
    zip_code: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    services: List[str] = []
    latitude: float
    longitude: float
    eligibility: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ResourceSubmission(BaseModel):
    name: str
    category: str
    description: str
    address: Optional[str] = None
    city: str
    county: str
    phone: Optional[str] = None
    website: Optional[str] = None
    services: Optional[str] = None
    submitterEmail: Optional[str] = None

# ============== RESOURCE ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "ReEntry Connect MN API"}

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    
    if category:
        query["category"] = category
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"services": {"$elemMatch": {"$regex": search, "$options": "i"}}}
        ]
    
    resources = await db.resources.find(query, {"_id": 0}).to_list(1000)
    
    for resource in resources:
        if isinstance(resource.get('created_at'), str):
            resource['created_at'] = datetime.fromisoformat(resource['created_at'].replace('Z', '+00:00'))
        if isinstance(resource.get('updated_at'), str):
            resource['updated_at'] = datetime.fromisoformat(resource['updated_at'].replace('Z', '+00:00'))
    
    return resources

@api_router.get("/resources/{resource_id}", response_model=Resource)
async def get_resource(resource_id: str):
    resource = await db.resources.find_one({"id": resource_id}, {"_id": 0})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if isinstance(resource.get('created_at'), str):
        resource['created_at'] = datetime.fromisoformat(resource['created_at'].replace('Z', '+00:00'))
    if isinstance(resource.get('updated_at'), str):
        resource['updated_at'] = datetime.fromisoformat(resource['updated_at'].replace('Z', '+00:00'))
    
    return resource

@api_router.post("/resources", response_model=Resource, status_code=201)
async def create_resource(input_data: ResourceCreate):
    resource_dict = input_data.model_dump()
    resource_obj = Resource(**resource_dict)
    
    doc = resource_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.resources.insert_one(doc)
    return resource_obj

@api_router.get("/categories")
async def get_categories():
    categories = [
        {"id": "housing", "name": "Housing & Shelter", "icon": "Home"},
        {"id": "legal", "name": "Legal Aid", "icon": "Scale"},
        {"id": "employment", "name": "Employment Services", "icon": "Briefcase"},
        {"id": "healthcare", "name": "Healthcare & Mental Health", "icon": "Heart"},
        {"id": "education", "name": "Education & Training", "icon": "GraduationCap"},
        {"id": "food", "name": "Food Assistance", "icon": "Utensils"}
    ]
    return categories

# ============== CHAT ENDPOINT ==============

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    
    system_message = """You are a helpful assistant for ReEntry Connect MN, a resource directory for individuals being released from incarceration in Minnesota. 

Your role is to:
1. Help users find appropriate resources (housing, legal aid, employment, healthcare, education, food assistance, transportation)
2. Provide information about reentry services in Minnesota
3. Be compassionate, non-judgmental, and supportive
4. Guide users to the resource directory when appropriate
5. Provide practical advice about the reentry process

When users ask about specific resources, suggest they use the search and filter features on the website to find current listings. Be encouraging and remind users that seeking help is a positive step.

Important: Always be respectful of users' dignity. Avoid assumptions and provide clear, helpful guidance."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        # Build conversation context
        for msg in request.history[-10:]:  # Keep last 10 messages for context
            if msg.role == "user":
                await chat.send_message(UserMessage(text=msg.content))
            # Assistant messages are already in the chat history
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(response=response, session_id=request.session_id)
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

# ============== RESOURCE SUBMISSION ENDPOINT ==============

@api_router.post("/submissions", status_code=201)
async def submit_resource(submission: ResourceSubmission):
    """Accept community resource submissions for review"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": submission.name,
        "category": submission.category,
        "description": submission.description,
        "address": submission.address,
        "city": submission.city,
        "county": submission.county,
        "phone": submission.phone,
        "website": submission.website,
        "services": submission.services,
        "submitter_email": submission.submitterEmail,
        "status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.submissions.insert_one(doc)
    logger.info(f"New resource submission: {submission.name}")
    return {"message": "Submission received", "id": doc["id"]}

@api_router.get("/submissions")
async def get_submissions():
    """Get all pending submissions (for admin review)"""
    submissions = await db.submissions.find({}, {"_id": 0}).to_list(100)
    return submissions

# ============== SEED DATA ENDPOINT ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with Minnesota reentry resources"""
    
    # Check if already seeded
    count = await db.resources.count_documents({})
    if count > 0:
        return {"message": f"Database already has {count} resources"}
    
    resources = [
        # ============== HOUSING ==============
        {
            "id": str(uuid.uuid4()),
            "name": "180 Degrees",
            "category": "housing",
            "description": "Provides transitional housing and comprehensive support services for men and women leaving incarceration, including case management and employment support.",
            "address": "2221 University Ave SE",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55414",
            "phone": "(612) 813-5050",
            "website": "https://180degrees.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Transitional Housing", "Case Management", "Employment Support", "Reentry Services"],
            "latitude": 44.9728,
            "longitude": -93.2219,
            "eligibility": "Adults leaving incarceration",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RS EDEN Community Reentry",
            "category": "housing",
            "description": "Offers community reentry halfway houses and criminal justice support services in St. Paul area.",
            "address": "1931 W Broadway Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 287-1594",
            "website": "https://rseden.org",
            "hours": "24/7",
            "services": ["Halfway House", "Residential Treatment", "Recovery Support", "Criminal Justice Support"],
            "latitude": 44.9996,
            "longitude": -93.3044,
            "eligibility": "Adults in criminal justice system or recovery",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Volunteers of America - Residential Reentry Centers",
            "category": "housing",
            "description": "Operates residential reentry centers for up to 74 people of all genders, providing transitional housing to complete sentences in the community.",
            "address": "7625 Metro Blvd",
            "city": "Edina",
            "state": "MN",
            "zip_code": "55439",
            "phone": "(952) 945-4000",
            "website": "https://voamn.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Residential Reentry", "Housing Assistance", "Veteran Services", "Case Management"],
            "latitude": 44.8613,
            "longitude": -93.3349,
            "eligibility": "Individuals completing sentences in community",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Catholic Charities Housing Services",
            "category": "housing",
            "description": "Emergency shelter, transitional housing, and permanent supportive housing programs throughout the Twin Cities.",
            "address": "1200 2nd Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55403",
            "phone": "(612) 204-8500",
            "website": "https://cctwincities.org",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Emergency Shelter", "Transitional Housing", "Case Management", "Housing Navigation"],
            "latitude": 44.9692,
            "longitude": -93.2750,
            "eligibility": "Homeless individuals and families",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Next Chapter Reentry Project",
            "category": "housing",
            "description": "Operates seven homes for men, women, and families in Rochester area including Discipleship Homes and The Lighthouse, emphasizing trauma-informed environments.",
            "address": "125 Live St SE",
            "city": "Rochester",
            "state": "MN",
            "zip_code": "55904",
            "phone": "(507) 258-4439",
            "website": "https://nextchapterrochester.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Transitional Housing", "Family Reentry", "Faith-Based Programs", "Mentoring"],
            "latitude": 44.0121,
            "longitude": -92.4631,
            "eligibility": "Men, women, and families returning from incarceration",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hearth Connection",
            "category": "housing",
            "description": "Housing-focused services using Housing First model for people experiencing homelessness in the Twin Cities.",
            "address": "2446 University Ave W, Suite 150",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55114",
            "phone": "(651) 645-0676",
            "website": "https://hearthconnection.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Housing First", "Rapid Rehousing", "Housing Stability", "Case Management"],
            "latitude": 44.9659,
            "longitude": -93.1970,
            "eligibility": "Homeless individuals",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Simpson Housing Services",
            "category": "housing",
            "description": "Emergency shelter and supportive housing with street outreach services in Minneapolis.",
            "address": "2100 Pillsbury Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 874-8683",
            "website": "https://simpsonhousing.org",
            "hours": "24/7 Shelter",
            "services": ["Emergency Shelter", "Supportive Housing", "Street Outreach", "Case Management"],
            "latitude": 44.9554,
            "longitude": -93.2778,
            "eligibility": "Adults experiencing homelessness",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "F5 Project",
            "category": "housing",
            "description": "Housing, recovery, employment, and reintegration services for those post-incarceration or addiction.",
            "address": "1101 W Broadway Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 234-5678",
            "website": "https://f5project.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Housing Support", "Recovery Services", "Employment", "Reintegration"],
            "latitude": 44.9988,
            "longitude": -93.2975,
            "eligibility": "Post-incarceration or addiction recovery",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== LEGAL AID ==============
        {
            "id": str(uuid.uuid4()),
            "name": "Legal Rights Center",
            "category": "legal",
            "description": "Free legal services focused on criminal defense and civil rights for low-income individuals.",
            "address": "1611 Park Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 337-0030",
            "website": "https://legalrightscenter.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Criminal Defense", "Expungement", "Record Clearing", "Civil Rights"],
            "latitude": 44.9574,
            "longitude": -93.2696,
            "eligibility": "Low-income individuals",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mid-Minnesota Legal Aid",
            "category": "legal",
            "description": "Provides free civil legal services including expungement assistance to low-income Minnesotans.",
            "address": "430 1st Ave N, Suite 300",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55401",
            "phone": "(612) 334-5970",
            "website": "https://mylegalaid.org",
            "hours": "Mon-Fri 8:30am-5pm",
            "services": ["Civil Legal Aid", "Housing Law", "Family Law", "Expungement"],
            "latitude": 44.9830,
            "longitude": -93.2697,
            "eligibility": "Low-income residents",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Volunteer Lawyers Network",
            "category": "legal",
            "description": "Pro bono legal assistance including expungement clinics for low-income individuals.",
            "address": "600 Nicollet Mall, Suite 390A",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55402",
            "phone": "(612) 752-6677",
            "website": "https://vlnmn.org",
            "hours": "Mon-Fri 9am-4pm",
            "services": ["Expungement Clinics", "Family Law", "Housing Issues", "Immigration"],
            "latitude": 44.9778,
            "longitude": -93.2712,
            "eligibility": "Low-income individuals",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Southern Minnesota Regional Legal Services",
            "category": "legal",
            "description": "Free civil legal services including expungement for southern Minnesota residents.",
            "address": "903 W Center St, Suite 230",
            "city": "Rochester",
            "state": "MN",
            "zip_code": "55902",
            "phone": "(507) 292-0080",
            "website": "https://smrls.org",
            "hours": "Mon-Fri 8:30am-4:30pm",
            "services": ["Civil Legal Aid", "Expungement", "Public Benefits", "Housing"],
            "latitude": 44.0218,
            "longitude": -92.4670,
            "eligibility": "Low-income southern MN residents",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin County Public Defender's Office",
            "category": "legal",
            "description": "Legal representation for those who cannot afford an attorney in criminal matters.",
            "address": "701 4th Ave S, Suite 900",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 348-7530",
            "website": "https://hennepin.us/publicdefender",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Criminal Defense", "Juvenile Defense", "Appeals"],
            "latitude": 44.9753,
            "longitude": -93.2663,
            "eligibility": "Individuals who cannot afford legal representation",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ramsey County Public Defender",
            "category": "legal",
            "description": "Public defense services for Ramsey County residents facing criminal charges.",
            "address": "50 W Kellogg Blvd, Suite 101",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55102",
            "phone": "(651) 266-9350",
            "website": "https://ramseycounty.us",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Criminal Defense", "Juvenile Defense", "Appeals"],
            "latitude": 44.9442,
            "longitude": -93.0952,
            "eligibility": "Ramsey County residents who qualify",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== EMPLOYMENT ==============
        {
            "id": str(uuid.uuid4()),
            "name": "HIRED",
            "category": "employment",
            "description": "Employment services and career development for job seekers facing barriers to employment.",
            "address": "1200 Plymouth Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 588-0571",
            "website": "https://hired.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Job Training", "Career Counseling", "Job Placement", "Support Services"],
            "latitude": 44.9978,
            "longitude": -93.2944,
            "eligibility": "Adults with employment barriers",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Goodwill-Easter Seals Minnesota",
            "category": "employment",
            "description": "Career training and employment services including financial coaching for people with barriers.",
            "address": "553 Fairview Ave N",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55104",
            "phone": "(651) 379-5800",
            "website": "https://goodwilleasterseals.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Job Training", "Career Services", "Financial Coaching", "Digital Skills"],
            "latitude": 44.9608,
            "longitude": -93.1412,
            "eligibility": "All job seekers",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RESOURCE Inc.",
            "category": "employment",
            "description": "Specialized employment and training services for individuals with criminal backgrounds.",
            "address": "2929 4th Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55408",
            "phone": "(612) 752-8600",
            "website": "https://resource-mn.org",
            "hours": "Mon-Fri 8:30am-4:30pm",
            "services": ["Job Readiness", "Employment Placement", "Support Services", "Background-Friendly Jobs"],
            "latitude": 44.9483,
            "longitude": -93.2750,
            "eligibility": "Adults with criminal records",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minnesota DEED CareerForce",
            "category": "employment",
            "description": "State workforce center providing employment services, job search assistance, and training programs.",
            "address": "332 Minnesota St, Suite E200",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55101",
            "phone": "(651) 259-7114",
            "website": "https://mn.gov/deed",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Job Search Assistance", "Career Counseling", "Training Programs", "Unemployment Insurance"],
            "latitude": 44.9446,
            "longitude": -93.0942,
            "eligibility": "All Minnesota residents",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Twin Cities RISE!",
            "category": "employment",
            "description": "Career training and personal empowerment program for adults facing barriers to employment.",
            "address": "800 Washington Ave N, Suite 203",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55401",
            "phone": "(612) 338-0295",
            "website": "https://twincitiesrise.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Career Training", "Personal Empowerment", "Job Placement", "Retention Support"],
            "latitude": 44.9876,
            "longitude": -93.2734,
            "eligibility": "Adults with barriers to employment",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emerge Community Development - RESTORE Program",
            "category": "employment",
            "description": "RESTORE program targets employment barriers for those with criminal histories via career coaching and specialized job training.",
            "address": "1834 Emerson Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 529-9267",
            "website": "https://emerge-mn.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["RESTORE Program", "Career Coaching", "Job Training", "Transitional Employment"],
            "latitude": 44.9992,
            "longitude": -93.2950,
            "eligibility": "Individuals with criminal histories",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Amicus Reconnect",
            "category": "employment",
            "description": "Volunteer mentor program supporting individuals reentering society for nearly 50 years through personal guidance and job support.",
            "address": "2822 Lyndale Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55408",
            "phone": "(612) 348-8570",
            "website": "https://amicususa.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Mentoring", "Job Support", "Reentry Guidance", "Personal Development"],
            "latitude": 44.9469,
            "longitude": -93.2878,
            "eligibility": "Individuals reentering from incarceration",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RISE Central Minnesota Works",
            "category": "employment",
            "description": "Employment-focused reentry program in Central Minnesota offering career planning, job coaching, and supported employment.",
            "address": "3333 Division St W",
            "city": "St. Cloud",
            "state": "MN",
            "zip_code": "56301",
            "phone": "(651) 257-2281",
            "website": "https://rise.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Career Planning", "Job Coaching", "Supported Employment", "Reentry Services"],
            "latitude": 45.5579,
            "longitude": -94.2053,
            "eligibility": "Ex-offenders in Stearns, Benton, Sherburne, Wright counties",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== HEALTHCARE ==============
        {
            "id": str(uuid.uuid4()),
            "name": "People Incorporated Mental Health Services",
            "category": "healthcare",
            "description": "Comprehensive mental health services including crisis support, ongoing care, and housing support.",
            "address": "2500 Chicago Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(651) 774-0011",
            "website": "https://peopleincorporated.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Mental Health Counseling", "Crisis Services", "Housing Support", "Case Management"],
            "latitude": 44.9534,
            "longitude": -93.2622,
            "eligibility": "All individuals seeking mental health support",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin Healthcare",
            "category": "healthcare",
            "description": "Comprehensive healthcare services including behavioral health and substance abuse treatment.",
            "address": "701 Park Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 873-3000",
            "website": "https://hennepinhealthcare.org",
            "hours": "24/7 Emergency; Clinics vary",
            "services": ["Medical Care", "Mental Health", "Substance Abuse Treatment", "Primary Care"],
            "latitude": 44.9725,
            "longitude": -93.2611,
            "eligibility": "All patients accepted",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "NorthPoint Health & Wellness Center",
            "category": "healthcare",
            "description": "Community health center providing medical, dental, and behavioral health services on a sliding fee scale.",
            "address": "1313 Penn Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 543-2500",
            "website": "https://northpointhealth.org",
            "hours": "Mon-Fri 8am-5pm, Sat 8am-12pm",
            "services": ["Primary Care", "Dental Care", "Mental Health", "Substance Abuse"],
            "latitude": 44.9958,
            "longitude": -93.2936,
            "eligibility": "All patients, sliding fee scale available",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hazelden Betty Ford Foundation",
            "category": "healthcare",
            "description": "Nationally recognized addiction treatment and recovery services including inpatient and outpatient programs.",
            "address": "15251 Pleasant Valley Rd",
            "city": "Center City",
            "state": "MN",
            "zip_code": "55012",
            "phone": "(800) 257-7810",
            "website": "https://hazeldenbettyford.org",
            "hours": "24/7",
            "services": ["Inpatient Treatment", "Outpatient Programs", "Family Programs", "Continuing Care"],
            "latitude": 45.3969,
            "longitude": -92.8168,
            "eligibility": "Individuals seeking addiction treatment",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Community-University Health Care Center (CUHCC)",
            "category": "healthcare",
            "description": "Federally qualified health center providing comprehensive primary care and social services.",
            "address": "2001 Bloomington Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 301-3433",
            "website": "https://cuhcc.umn.edu",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Primary Care", "Dental Care", "Mental Health", "Social Services"],
            "latitude": 44.9551,
            "longitude": -93.2482,
            "eligibility": "All patients, sliding fee scale",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mental Health Resources",
            "category": "healthcare",
            "description": "Comprehensive mental health and addiction treatment services including trauma recovery.",
            "address": "1821 University Ave W, Suite S256",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55104",
            "phone": "(651) 659-2900",
            "website": "https://mhresources.com",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Mental Health Therapy", "Addiction Counseling", "Psychiatric Services", "Trauma Recovery"],
            "latitude": 44.9556,
            "longitude": -93.1783,
            "eligibility": "All individuals seeking mental health services",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emerge ReEntry Trauma Recovery (RTR)",
            "category": "healthcare",
            "description": "Specialized trauma recovery groups for individuals in the reentry process.",
            "address": "1834 Emerson Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 529-9267",
            "website": "https://emerge-mn.org/reentry-services",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Trauma Recovery Groups", "Mental Health Support", "Reentry Counseling"],
            "latitude": 44.9992,
            "longitude": -93.2950,
            "eligibility": "Individuals in reentry process",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== EDUCATION ==============
        {
            "id": str(uuid.uuid4()),
            "name": "Summit Academy OIC",
            "category": "education",
            "description": "Career training and education for underserved communities including GED programs and construction training.",
            "address": "935 Olson Memorial Hwy",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55405",
            "phone": "(612) 377-0150",
            "website": "https://saoic.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["GED Programs", "Career Training", "Construction Training", "Healthcare Training"],
            "latitude": 44.9830,
            "longitude": -93.2920,
            "eligibility": "Adults seeking education and training",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Saint Paul College",
            "category": "education",
            "description": "Community college offering support services for returning students including those with barriers.",
            "address": "235 Marshall Ave",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55102",
            "phone": "(651) 846-1600",
            "website": "https://saintpaul.edu",
            "hours": "Mon-Fri 7:30am-6pm",
            "services": ["College Courses", "Certificate Programs", "Student Support", "Financial Aid"],
            "latitude": 44.9448,
            "longitude": -93.1052,
            "eligibility": "All students",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minneapolis Adult Education",
            "category": "education",
            "description": "Free adult basic education, GED preparation, and English classes for adults.",
            "address": "3225 Bloomington Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55407",
            "phone": "(612) 668-3800",
            "website": "https://mae.mpls.k12.mn.us",
            "hours": "Mon-Thu 8am-8pm, Fri 8am-4pm",
            "services": ["GED Preparation", "English Classes", "Basic Skills", "Career Pathways"],
            "latitude": 44.9384,
            "longitude": -93.2476,
            "eligibility": "Adults 17 and older",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minneapolis Community & Technical College",
            "category": "education",
            "description": "Two-year college offering degrees, certificates, and workforce training with support services.",
            "address": "1501 Hennepin Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55403",
            "phone": "(612) 659-6000",
            "website": "https://minneapolis.edu",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Associate Degrees", "Certificates", "Workforce Development", "Student Support"],
            "latitude": 44.9710,
            "longitude": -93.2860,
            "eligibility": "All students",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Literacy Minnesota",
            "category": "education",
            "description": "Adult literacy programs including reading, writing, and digital skills training.",
            "address": "700 Raymond Ave, Suite 180",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55114",
            "phone": "(651) 251-9110",
            "website": "https://literacymn.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Adult Literacy", "English Classes", "Digital Literacy", "Tutoring"],
            "latitude": 44.9630,
            "longitude": -93.1950,
            "eligibility": "Adults seeking literacy services",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== FOOD ASSISTANCE ==============
        {
            "id": str(uuid.uuid4()),
            "name": "Second Harvest Heartland",
            "category": "food",
            "description": "Major food bank serving the Twin Cities and greater Minnesota with food shelf locator.",
            "address": "7101 Winnetka Ave N",
            "city": "Brooklyn Park",
            "state": "MN",
            "zip_code": "55428",
            "phone": "(651) 484-5117",
            "website": "https://2harvest.org",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Food Distribution", "Food Shelf Locator", "SNAP Assistance", "Agency Network"],
            "latitude": 45.0913,
            "longitude": -93.3684,
            "eligibility": "Anyone in need of food assistance",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Salvation Army Twin Cities",
            "category": "food",
            "description": "Emergency food assistance, holiday programs, and other support services.",
            "address": "2445 Prior Ave N",
            "city": "Roseville",
            "state": "MN",
            "zip_code": "55113",
            "phone": "(651) 746-3400",
            "website": "https://salvationarmynorth.org",
            "hours": "Mon-Fri 9am-4pm",
            "services": ["Food Pantry", "Emergency Assistance", "Holiday Programs", "Utility Assistance"],
            "latitude": 45.0178,
            "longitude": -93.1549,
            "eligibility": "Anyone in need",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Loaves and Fishes",
            "category": "food",
            "description": "Free hot meals at multiple dining sites throughout the Twin Cities area.",
            "address": "1325 4th St SE",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55414",
            "phone": "(612) 377-9810",
            "website": "https://loavesandfishesmn.org",
            "hours": "Meal times vary by location",
            "services": ["Hot Meals", "Community Dining", "Multiple Locations"],
            "latitude": 44.9755,
            "longitude": -93.2303,
            "eligibility": "Anyone in need of a meal",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "PRISM (People Responding In Social Ministry)",
            "category": "food",
            "description": "Food shelf and social services in Golden Valley area including senior programs.",
            "address": "1220 Zane Ave N",
            "city": "Golden Valley",
            "state": "MN",
            "zip_code": "55422",
            "phone": "(763) 529-1350",
            "website": "https://prismmpls.org",
            "hours": "Mon-Fri 9am-3pm",
            "services": ["Food Shelf", "Emergency Assistance", "Senior Programs", "Utility Assistance"],
            "latitude": 44.9947,
            "longitude": -93.3580,
            "eligibility": "Residents of service area",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin County SNAP Office",
            "category": "food",
            "description": "SNAP (food stamps) enrollment and benefits assistance for Hennepin County residents.",
            "address": "525 Portland Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 596-1300",
            "website": "https://hennepin.us/snap",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["SNAP Enrollment", "Benefits Assistance", "Application Help", "Eligibility Screening"],
            "latitude": 44.9738,
            "longitude": -93.2628,
            "eligibility": "Hennepin County residents meeting income guidelines",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Open Arms of Minnesota",
            "category": "food",
            "description": "Provides free, nutritious meals to people living with serious illnesses.",
            "address": "2500 Bloomington Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 872-1152",
            "website": "https://openarmsmn.org",
            "hours": "Mon-Fri 8am-4pm",
            "services": ["Meal Delivery", "Nutrition Support", "Client Services"],
            "latitude": 44.9532,
            "longitude": -93.2476,
            "eligibility": "People living with serious illnesses",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.resources.insert_many(resources)
    return {"message": f"Successfully seeded {len(resources)} resources"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
