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
    # Enhanced fields
    serving_area: Optional[str] = None
    access_method: Optional[str] = None
    good_fit_if: Optional[str] = None
    what_to_expect: Optional[str] = None
    reentry_focused: bool = True
    cost: Optional[str] = None
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
    # Enhanced fields
    serving_area: Optional[str] = None
    access_method: Optional[str] = None
    good_fit_if: Optional[str] = None
    what_to_expect: Optional[str] = None
    reentry_focused: bool = True
    cost: Optional[str] = None

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
    
    system_message = """You help people find reentry resources in Minnesota.

Style:
- Keep responses to 3-4 short sentences max.
- Give 1-2 clear, concrete starting points, not exhaustive lists.
- Use plain, warm language. Avoid bureaucratic or institutional phrasing.
- Say "would you like" instead of "do you need."

Approach:
- Never assume crisis, urgency, or vulnerability.
- Offer help first, then invite more detail if they want.
- Ask at most ONE optional follow-up, phrased as a choice.
- Frame follow-ups as choices, not diagnostic questions.

Example for housing:
"A good starting point is 180 Degrees, they connect people with housing and support services. Would you like info for a specific part of Minnesota?"

Do not use lists, bullet points, or special characters except commas, periods, and question marks."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        for msg in request.history[-10:]:
            if msg.role == "user":
                await chat.send_message(UserMessage(text=msg.content))
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Clean response - only allow letters, numbers, spaces, and _ , . ?
        import re
        cleaned = re.sub(r'[^a-zA-Z0-9\s_,.\?]', '', response)
        
        return ChatResponse(response=cleaned.strip(), session_id=request.session_id)
    
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
            "description": "Provides transitional housing with case management and employment support for people leaving incarceration.",
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
            "serving_area": "Hennepin County",
            "access_method": "Call to inquire",
            "good_fit_if": "You're looking for transitional housing with structured support after release.",
            "what_to_expect": "Initial phone intake, then in-person meeting, housing placement as available, ongoing case management.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RS EDEN Community Reentry",
            "category": "housing",
            "description": "Offers community reentry halfway houses and support services in the Minneapolis area.",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Referral required",
            "good_fit_if": "You're transitioning from incarceration and looking for a structured living environment with recovery support.",
            "what_to_expect": "Referral process, intake assessment, residential placement, daily programming.",
            "reentry_focused": True,
            "cost": "Varies, often covered by referral agency",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Volunteers of America - Residential Reentry Centers",
            "category": "housing",
            "description": "Operates residential reentry centers providing transitional housing to complete sentences in the community.",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Referral from corrections",
            "good_fit_if": "You're completing your sentence in the community and need structured housing.",
            "what_to_expect": "Placement through corrections, structured daily schedule, case management support.",
            "reentry_focused": True,
            "cost": "No cost to participants",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Walk-in available for shelter, call for other programs",
            "good_fit_if": "You need emergency shelter or help finding stable housing.",
            "what_to_expect": "Shelter intake same day if space available, housing programs have waitlists.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Next Chapter Reentry Project",
            "category": "housing",
            "description": "Operates homes for men, women, and families in Rochester area with trauma-informed support.",
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
            "serving_area": "Olmsted County (Rochester area)",
            "access_method": "Call to inquire",
            "good_fit_if": "You're in the Rochester area and looking for faith-friendly transitional housing.",
            "what_to_expect": "Phone conversation, application process, housing placement based on availability.",
            "reentry_focused": True,
            "cost": "Sliding scale",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hearth Connection",
            "category": "housing",
            "description": "Housing-focused services using Housing First model for people experiencing homelessness.",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to inquire",
            "good_fit_if": "You're experiencing homelessness and want help finding permanent housing quickly.",
            "what_to_expect": "Assessment, housing search assistance, move-in support, ongoing stability services.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Minneapolis",
            "access_method": "Walk-in for shelter",
            "good_fit_if": "You need a safe place to stay tonight in Minneapolis.",
            "what_to_expect": "Same-day shelter intake if space available, meals and basic needs provided.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "F5 Project",
            "category": "housing",
            "description": "Housing, recovery, employment, and reintegration services for those post-incarceration or in recovery.",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to inquire",
            "good_fit_if": "You're looking for comprehensive support including housing, work, and recovery.",
            "what_to_expect": "Initial conversation, needs assessment, connection to appropriate services.",
            "reentry_focused": True,
            "cost": "Free",
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
            "serving_area": "Hennepin County",
            "access_method": "Call to schedule",
            "good_fit_if": "You need help with criminal defense or want to clear your record.",
            "what_to_expect": "Phone screening, appointment scheduled, attorney consultation.",
            "reentry_focused": True,
            "cost": "Free for qualifying individuals",
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
            "serving_area": "Central Minnesota",
            "access_method": "Call intake line",
            "good_fit_if": "You need help with civil legal matters like housing, family, or clearing records.",
            "what_to_expect": "Phone intake, eligibility check, case assignment if accepted.",
            "reentry_focused": False,
            "cost": "Free for qualifying individuals",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call or attend clinic",
            "good_fit_if": "You want to attend a free legal clinic or need pro bono help.",
            "what_to_expect": "Clinic attendance or phone intake, matched with volunteer attorney.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Southern Minnesota",
            "access_method": "Call intake line",
            "good_fit_if": "You're in southern Minnesota and need civil legal help.",
            "what_to_expect": "Phone intake, eligibility screening, case assignment.",
            "reentry_focused": False,
            "cost": "Free for qualifying individuals",
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
            "serving_area": "Hennepin County",
            "access_method": "Court appointment",
            "good_fit_if": "You have a criminal case in Hennepin County and cannot afford an attorney.",
            "what_to_expect": "Attorney assigned through court process.",
            "reentry_focused": False,
            "cost": "Free for qualifying individuals",
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
            "serving_area": "Ramsey County",
            "access_method": "Court appointment",
            "good_fit_if": "You have a criminal case in Ramsey County and cannot afford an attorney.",
            "what_to_expect": "Attorney assigned through court process.",
            "reentry_focused": False,
            "cost": "Free for qualifying individuals",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call or walk-in",
            "good_fit_if": "You're looking for job training and placement support.",
            "what_to_expect": "Orientation session, career assessment, personalized job search support.",
            "reentry_focused": True,
            "cost": "Free",
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
            "serving_area": "Statewide",
            "access_method": "Walk-in or call",
            "good_fit_if": "You want career training, job search help, or digital skills classes.",
            "what_to_expect": "Career assessment, training enrollment, job placement assistance.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to schedule",
            "good_fit_if": "You have a criminal background and want help finding work.",
            "what_to_expect": "Intake appointment, job readiness training, connection to employers who hire.",
            "reentry_focused": True,
            "cost": "Free",
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
            "serving_area": "Statewide",
            "access_method": "Walk-in or online",
            "good_fit_if": "You want access to job listings, resume help, or training programs.",
            "what_to_expect": "Self-service resources available, staff assistance by appointment.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to apply",
            "good_fit_if": "You want intensive career training with personal development support.",
            "what_to_expect": "Application process, multi-week training program, job placement, follow-up support.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emerge Community Development - RESTORE Program",
            "category": "employment",
            "description": "RESTORE program provides career coaching and job training for people with criminal histories.",
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
            "serving_area": "North Minneapolis",
            "access_method": "Call to inquire",
            "good_fit_if": "You're in North Minneapolis and want focused career support.",
            "what_to_expect": "Intake meeting, enrollment in RESTORE program, ongoing coaching.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Amicus Reconnect",
            "category": "employment",
            "description": "Volunteer mentor program supporting individuals reentering society through personal guidance and job support.",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to get matched with a mentor",
            "good_fit_if": "You'd like one-on-one support from a trained volunteer mentor.",
            "what_to_expect": "Matching process, regular meetings with mentor, ongoing support.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RISE Central Minnesota Works",
            "category": "employment",
            "description": "Employment-focused reentry program in Central Minnesota offering career planning and job coaching.",
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
            "serving_area": "Stearns, Benton, Sherburne, Wright counties",
            "access_method": "Call to inquire",
            "good_fit_if": "You're in Central Minnesota and want employment-focused reentry support.",
            "what_to_expect": "Assessment, career planning, job search support, ongoing coaching.",
            "reentry_focused": True,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to schedule",
            "good_fit_if": "You're looking for mental health support or crisis services.",
            "what_to_expect": "Phone intake, appointment scheduled, ongoing care as needed.",
            "reentry_focused": False,
            "cost": "Sliding scale, insurance accepted",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin Healthcare",
            "category": "healthcare",
            "description": "Comprehensive healthcare services including behavioral health and substance use treatment.",
            "address": "701 Park Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 873-3000",
            "website": "https://hennepinhealthcare.org",
            "hours": "24/7 Emergency; Clinics vary",
            "services": ["Medical Care", "Mental Health", "Substance Use Treatment", "Primary Care"],
            "latitude": 44.9725,
            "longitude": -93.2611,
            "serving_area": "Hennepin County",
            "access_method": "Walk-in for emergency, call for appointments",
            "good_fit_if": "You need medical care, mental health services, or substance use treatment.",
            "what_to_expect": "Emergency services available 24/7, clinic appointments scheduled.",
            "reentry_focused": False,
            "cost": "Sliding scale, insurance accepted, financial assistance available",
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
            "services": ["Primary Care", "Dental Care", "Mental Health", "Substance Use"],
            "latitude": 44.9958,
            "longitude": -93.2936,
            "serving_area": "North Minneapolis",
            "access_method": "Call or walk-in",
            "good_fit_if": "You need affordable medical, dental, or mental health care in North Minneapolis.",
            "what_to_expect": "Same-day appointments often available, sliding fee based on income.",
            "reentry_focused": False,
            "cost": "Sliding scale based on income",
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
            "serving_area": "Statewide",
            "access_method": "Call to inquire",
            "good_fit_if": "You're looking for comprehensive addiction treatment and recovery support.",
            "what_to_expect": "Phone assessment, admission process, personalized treatment plan.",
            "reentry_focused": False,
            "cost": "Insurance accepted, financial assistance available",
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
            "serving_area": "South Minneapolis",
            "access_method": "Call to schedule",
            "good_fit_if": "You need affordable primary care, dental, or mental health services.",
            "what_to_expect": "Appointment scheduled, sliding fee available.",
            "reentry_focused": False,
            "cost": "Sliding scale based on income",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to schedule",
            "good_fit_if": "You're looking for mental health therapy or addiction counseling.",
            "what_to_expect": "Phone intake, appointment with therapist or counselor.",
            "reentry_focused": False,
            "cost": "Insurance accepted, sliding scale available",
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
            "serving_area": "North Minneapolis",
            "access_method": "Call to inquire",
            "good_fit_if": "You're in reentry and want support processing past experiences.",
            "what_to_expect": "Group sessions focused on healing and building coping skills.",
            "reentry_focused": True,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call or attend info session",
            "good_fit_if": "You want to get your GED or train for a career in construction or healthcare.",
            "what_to_expect": "Information session, enrollment, structured training program.",
            "reentry_focused": True,
            "cost": "Free or low cost",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Apply online or in person",
            "good_fit_if": "You want to start or continue college education with student support.",
            "what_to_expect": "Admissions process, financial aid assistance, academic advising.",
            "reentry_focused": False,
            "cost": "Tuition varies, financial aid available",
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
            "serving_area": "Minneapolis",
            "access_method": "Walk-in or call",
            "good_fit_if": "You want to work on basic skills, get your GED, or improve English.",
            "what_to_expect": "Assessment, class placement, flexible scheduling.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Apply online",
            "good_fit_if": "You want to earn a degree or certificate with student support services.",
            "what_to_expect": "Admissions, orientation, academic advising, support services.",
            "reentry_focused": False,
            "cost": "Tuition varies, financial aid available",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to enroll",
            "good_fit_if": "You want to improve reading, writing, or computer skills.",
            "what_to_expect": "Assessment, matched with tutor or class, flexible scheduling.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Statewide",
            "access_method": "Use food shelf locator on website",
            "good_fit_if": "You need help finding food shelves or applying for SNAP benefits.",
            "what_to_expect": "Website locator finds nearby food shelves, phone support available.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Walk-in or call",
            "good_fit_if": "You need emergency food or help with utilities.",
            "what_to_expect": "Brief intake, food provided same day, referrals to other services.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Walk-in, no registration needed",
            "good_fit_if": "You want a hot meal in a welcoming community setting.",
            "what_to_expect": "Show up during meal time, no questions asked.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Golden Valley, Robbinsdale, Crystal, New Hope",
            "access_method": "Walk-in during food shelf hours",
            "good_fit_if": "You live in the Golden Valley area and need food or emergency help.",
            "what_to_expect": "Brief intake, food provided, referrals available.",
            "reentry_focused": False,
            "cost": "Free",
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
            "serving_area": "Hennepin County",
            "access_method": "Apply online, by phone, or in person",
            "good_fit_if": "You want to apply for SNAP benefits or need help with your application.",
            "what_to_expect": "Application assistance, eligibility determination, benefits issued if approved.",
            "reentry_focused": False,
            "cost": "Free to apply",
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
            "serving_area": "Twin Cities Metro",
            "access_method": "Call to enroll",
            "good_fit_if": "You have a serious illness and need nutritious meals delivered.",
            "what_to_expect": "Phone enrollment, meals delivered to your home.",
            "reentry_focused": False,
            "cost": "Free",
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
