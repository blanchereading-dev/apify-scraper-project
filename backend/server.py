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
            "description": "Structured 60-day transitional housing at three Minneapolis locations. Bundled with mandatory employment assistance through SONIC program and case management. Residents must maintain sobriety and actively seek work and permanent housing.",
            "address": "236 Clifton Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55403",
            "phone": "(612) 813-5050",
            "website": "https://180degrees.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Transitional Housing", "Case Management", "Employment Support", "SONIC Job Program", "RECONNECT Pre-Release"],
            "latitude": 44.9728,
            "longitude": -93.2219,
            "serving_area": "Hennepin County",
            "good_fit_if": "You want structured transitional housing with built-in job search support and accountability.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "RS EDEN Community Reentry",
            "category": "housing",
            "description": "Two St. Paul halfway houses with 24/7 supervision. Combines structured residential treatment with substance use counseling, mental health services, and discharge planning. Daily programming required.",
            "address": "1931 W Broadway Ave",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 782-2994",
            "website": "https://rseden.org",
            "hours": "24/7",
            "services": ["Halfway House", "Substance Use Treatment", "Mental Health Services", "Discharge Planning", "Recovery Support"],
            "latitude": 44.9996,
            "longitude": -93.3044,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You need structured halfway house living with integrated recovery and mental health support.",
            "reentry_focused": True,
            "cost": "Often covered by referral agency",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Volunteers of America - Roseville Reentry Center",
            "category": "housing",
            "description": "58-bed federal residential reentry center for men and women completing sentences in the community. Highly structured with daily schedules, curfews, and required programming. Includes job readiness and case management.",
            "address": "2445 Prior Ave N",
            "city": "Roseville",
            "state": "MN",
            "zip_code": "55113",
            "phone": "(651) 287-2100",
            "website": "https://voamnwi.org/residential-reentry-centers",
            "hours": "24/7",
            "services": ["Residential Reentry", "Job Readiness Training", "Case Management", "Transportation Assistance"],
            "latitude": 45.0178,
            "longitude": -93.1549,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You have a federal referral and need structured housing while completing your sentence in the community.",
            "reentry_focused": True,
            "cost": "No cost to participants",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Catholic Charities Dorothy Day Center",
            "category": "housing",
            "description": "Same-day emergency shelter beds in downtown Minneapolis plus long-term supportive housing options. Self-directed shelter access with optional case management and housing navigation services.",
            "address": "1200 2nd Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55403",
            "phone": "(612) 204-8500",
            "website": "https://cctwincities.org",
            "hours": "24/7 Shelter",
            "services": ["Emergency Shelter", "Supportive Housing", "Case Management", "Housing Navigation"],
            "latitude": 44.9692,
            "longitude": -93.2750,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You need immediate shelter tonight or help navigating into stable housing.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hearth Connection",
            "category": "housing",
            "description": "Housing First approach prioritizing rapid placement into permanent housing. Self-directed program with voluntary case management. Focuses on housing stability without requiring sobriety or program completion first.",
            "address": "2446 University Ave W, Suite 150",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55114",
            "phone": "(651) 645-0676",
            "website": "https://hearthconnection.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Housing First", "Rapid Rehousing", "Housing Stability", "Voluntary Case Management"],
            "latitude": 44.9659,
            "longitude": -93.1970,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want help getting into permanent housing quickly without program requirements.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Simpson Housing Services",
            "category": "housing",
            "description": "Emergency overnight shelter plus street outreach in Minneapolis. Low-barrier access with meals and basic needs. Optional supportive housing programs available for longer-term stability.",
            "address": "2100 Pillsbury Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 874-8683",
            "website": "https://simpsonhousing.org",
            "hours": "24/7 Shelter",
            "services": ["Emergency Shelter", "Street Outreach", "Meals", "Supportive Housing"],
            "latitude": 44.9554,
            "longitude": -93.2778,
            "serving_area": "Minneapolis",
            "good_fit_if": "You need a safe place to sleep tonight with no questions asked.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== LEGAL AID ==============
        {
            "id": str(uuid.uuid4()),
            "name": "Legal Rights Center",
            "category": "legal",
            "description": "Free criminal defense for adults and juveniles plus Know Your Rights community workshops. Handles active cases only, not expungement. Also runs youth diversion programs through restorative justice partnerships.",
            "address": "1611 Park Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(612) 337-0030",
            "website": "https://legalrightscenter.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Criminal Defense", "Juvenile Defense", "Restorative Justice", "Know Your Rights Training"],
            "latitude": 44.9574,
            "longitude": -93.2696,
            "serving_area": "Hennepin County",
            "good_fit_if": "You need a public defender for an active criminal case or want to attend a Know Your Rights workshop.",
            "reentry_focused": True,
            "cost": "Free for qualifying individuals",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mid-Minnesota Legal Aid - Expungement",
            "category": "legal",
            "description": "Free expungement assistance through main office and community clinics at American Indian Center, African Community Services, and Division of Indian Work. Walk-ins welcome at clinics; appointments preferred at main office.",
            "address": "111 N 5th St, Suite 100",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55403",
            "phone": "(612) 334-5970",
            "website": "https://mylegalaid.org",
            "hours": "Mon-Thu 8:30am-4:30pm, Fri 8:30am-12pm",
            "services": ["Expungement", "Record Sealing", "Civil Legal Aid", "Community Clinics"],
            "latitude": 44.9830,
            "longitude": -93.2697,
            "serving_area": "Central Minnesota",
            "good_fit_if": "You want help sealing or clearing your criminal record.",
            "reentry_focused": True,
            "cost": "Free for qualifying individuals",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Volunteer Lawyers Network - Expungement Clinics",
            "category": "legal",
            "description": "Walk-in expungement clinics plus telephone advice line. Volunteer attorneys handle record clearing, family law, housing disputes. No appointment needed for clinics.",
            "address": "600 Nicollet Mall, Suite 390A",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55402",
            "phone": "(612) 752-6677",
            "website": "https://vlnmn.org",
            "hours": "Mon-Fri 9am-4pm",
            "services": ["Expungement Clinics", "Telephone Legal Advice", "Family Law", "Housing Issues"],
            "latitude": 44.9778,
            "longitude": -93.2712,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want to attend a free walk-in legal clinic for expungement or other civil matters.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minnesota Attorney General - Expungement Program",
            "category": "legal",
            "description": "Statewide expungement assistance through HelpSealMyRecord.org. Online screening tool determines eligibility. Provides guidance through the court filing process.",
            "address": "445 Minnesota St, Suite 1400",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55101",
            "phone": "(651) 296-3353",
            "website": "https://www.ag.state.mn.us/Consumer/Publications/Expungement.asp",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Expungement Screening", "Record Sealing", "Court Filing Guidance"],
            "latitude": 44.9446,
            "longitude": -93.0942,
            "serving_area": "Statewide",
            "good_fit_if": "You want to check expungement eligibility online and get guidance filing paperwork yourself.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Southern Minnesota Regional Legal Services",
            "category": "legal",
            "description": "Free civil legal help for southern Minnesota including expungement, housing disputes, and public benefits. Handles cases from Rochester to the Iowa border.",
            "address": "903 W Center St, Suite 230",
            "city": "Rochester",
            "state": "MN",
            "zip_code": "55902",
            "phone": "(507) 292-0080",
            "website": "https://smrls.org",
            "hours": "Mon-Fri 8:30am-4:30pm",
            "services": ["Expungement", "Housing Law", "Public Benefits", "Civil Legal Aid"],
            "latitude": 44.0218,
            "longitude": -92.4670,
            "serving_area": "Southern Minnesota",
            "good_fit_if": "You live in southern Minnesota and need civil legal help including record clearing.",
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
            "description": "Self-directed job search support including resume workshops, interview prep, and job fairs. Short-term Career Pathways training in healthcare, manufacturing, and customer service. Drop-in resources plus one-on-one counseling available.",
            "address": "1200 Plymouth Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 529-3342",
            "website": "https://hired.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Resume Workshops", "Interview Prep", "Career Pathways Training", "Job Fairs", "Career Counseling"],
            "latitude": 44.9978,
            "longitude": -93.2944,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want job search help and short-term training to get hired quickly.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Twin Cities RISE!",
            "category": "employment",
            "description": "Intensive 8-week career training combining professional skills with personal empowerment and emotional intelligence. Includes 10-week paid internships after completion. Graduates average $44K salary vs $16K pre-program.",
            "address": "1301 Bryant Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 338-0295",
            "website": "https://twincitiesrise.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["8-Week Career Training", "Personal Empowerment", "Paid Internships", "Job Placement", "Retention Support"],
            "latitude": 44.9876,
            "longitude": -93.2734,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want intensive career training with personal development and a pathway to a living-wage job.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "EMERGE Minnesota - RESTORE Program",
            "category": "employment",
            "description": "Employment program specifically for people with criminal histories. Combines career coaching, job training, and transitional employment. Also offers ProPEL pre-release services and trauma recovery groups.",
            "address": "1834 Emerson Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 529-9267",
            "website": "https://emerge-mn.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["RESTORE Employment Program", "Career Coaching", "Transitional Jobs", "ProPEL Pre-Release", "Trauma Recovery"],
            "latitude": 44.9992,
            "longitude": -93.2950,
            "serving_area": "Minneapolis",
            "good_fit_if": "You have a criminal history and want targeted employment support from reentry specialists.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Amicus Reconnect (VOA)",
            "category": "employment",
            "description": "One-to-one volunteer mentoring for people leaving incarceration. Long-term relationships lasting months to years. Drop-in center with job search resources, housing referrals, and Will's Fund scholarships for education.",
            "address": "2822 Lyndale Ave S",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55408",
            "phone": "(612) 870-7655",
            "website": "https://voamnwi.org/amicus-reconnect-services",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["One-to-One Mentoring", "Drop-In Center", "Job Search Support", "Education Scholarships", "Housing Referrals"],
            "latitude": 44.9469,
            "longitude": -93.2878,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want ongoing personal support from a volunteer mentor as you rebuild your life.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minnesota CareerForce",
            "category": "employment",
            "description": "State workforce centers with self-service job boards, computers, and printers. Staff available for resume reviews and career counseling by appointment. Connects to unemployment insurance and training grants.",
            "address": "332 Minnesota St, Suite E200",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55101",
            "phone": "(651) 259-7114",
            "website": "https://mn.gov/deed/job-seekers/workforce-centers/",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Job Search Computers", "Resume Help", "Career Counseling", "Training Grants", "Unemployment Insurance"],
            "latitude": 44.9446,
            "longitude": -93.0942,
            "serving_area": "Statewide",
            "good_fit_if": "You want free access to job search tools and staff support at your own pace.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Goodwill-Easter Seals Minnesota",
            "category": "employment",
            "description": "Career services combining job search support with financial coaching and digital skills classes. Multiple Twin Cities locations plus retail stores that provide transitional employment opportunities.",
            "address": "553 Fairview Ave N",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55104",
            "phone": "(651) 379-5800",
            "website": "https://goodwilleasterseals.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Job Search Support", "Financial Coaching", "Digital Skills Training", "Transitional Employment"],
            "latitude": 44.9608,
            "longitude": -93.1412,
            "serving_area": "Statewide",
            "good_fit_if": "You want career help bundled with money management skills and computer training.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "T.O.N.E. U.P.",
            "category": "employment",
            "description": "Reentry organization run by formerly incarcerated leaders. Offers employment support, Clean Slate Act navigation for expungement, housing connections, and leadership programs including Liberation of Leaders Fellowship.",
            "address": "Minneapolis",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 326-4900",
            "website": "https://toneup.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Employment Support", "Clean Slate Navigation", "Housing Connections", "Leadership Programs", "Mental Health Support"],
            "latitude": 44.9778,
            "longitude": -93.2712,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want support from people who have been through reentry themselves.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ============== HEALTHCARE ==============
        {
            "id": str(uuid.uuid4()),
            "name": "People Incorporated",
            "category": "healthcare",
            "description": "Full-spectrum mental health services from crisis intervention to ongoing therapy. Includes housing support programs for people with mental health needs. Self-referral accepted; sliding scale fees.",
            "address": "2500 Chicago Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55404",
            "phone": "(651) 774-0011",
            "website": "https://peopleincorporated.org",
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Mental Health Therapy", "Crisis Services", "Housing Support", "Psychiatric Services"],
            "latitude": 44.9534,
            "longitude": -93.2622,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You need mental health support from therapy to crisis care with housing assistance available.",
            "reentry_focused": False,
            "cost": "Sliding scale, insurance accepted",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin Healthcare",
            "category": "healthcare",
            "description": "County hospital with 24/7 emergency services plus primary care clinics. Integrated behavioral health and substance use treatment. Financial assistance available regardless of insurance status.",
            "address": "701 Park Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 873-3000",
            "website": "https://hennepinhealthcare.org",
            "hours": "24/7 Emergency; Clinics vary",
            "services": ["Emergency Care", "Primary Care", "Mental Health", "Substance Use Treatment", "Financial Assistance"],
            "latitude": 44.9725,
            "longitude": -93.2611,
            "serving_area": "Hennepin County",
            "good_fit_if": "You need medical care and may not have insurance or ability to pay.",
            "reentry_focused": False,
            "cost": "Financial assistance available",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "NorthPoint Health & Wellness",
            "category": "healthcare",
            "description": "Community health center in North Minneapolis offering medical, dental, and mental health under one roof. Income-based sliding scale with same-day appointments often available. Walk-ins welcome.",
            "address": "1313 Penn Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 543-2500",
            "website": "https://northpointhealth.org",
            "hours": "Mon-Fri 8am-5pm, Sat 8am-12pm",
            "services": ["Primary Care", "Dental Care", "Mental Health", "Walk-In Clinic"],
            "latitude": 44.9958,
            "longitude": -93.2936,
            "serving_area": "North Minneapolis",
            "good_fit_if": "You want medical, dental, and mental health care at one location with affordable pricing.",
            "reentry_focused": False,
            "cost": "Sliding scale based on income",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hazelden Betty Ford - Center City",
            "category": "healthcare",
            "description": "Residential addiction treatment ranging from 28-day programs to extended care. Structured recovery environment with individual and group therapy, family programs, and alumni support network.",
            "address": "15251 Pleasant Valley Rd",
            "city": "Center City",
            "state": "MN",
            "zip_code": "55012",
            "phone": "(800) 257-7810",
            "website": "https://hazeldenbettyford.org",
            "hours": "24/7",
            "services": ["Inpatient Treatment", "Extended Care", "Family Programs", "Alumni Support", "Continuing Care"],
            "latitude": 45.3969,
            "longitude": -92.8168,
            "serving_area": "Statewide",
            "good_fit_if": "You want intensive residential addiction treatment with long-term recovery support.",
            "reentry_focused": False,
            "cost": "Insurance accepted, financial assistance available",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "EMERGE Trauma Recovery Groups",
            "category": "healthcare",
            "description": "Group therapy specifically designed for people in reentry dealing with trauma from incarceration. Peer-informed approach led by trained facilitators. Part of EMERGE's bundled reentry services.",
            "address": "1834 Emerson Ave N",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55411",
            "phone": "(612) 529-9267",
            "website": "https://emerge-mn.org/reentry-services",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Trauma Recovery Groups", "Peer Support", "Reentry Counseling"],
            "latitude": 44.9992,
            "longitude": -93.2950,
            "serving_area": "Minneapolis",
            "good_fit_if": "You want group support for processing trauma from incarceration with others who understand.",
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
            "description": "Free 20-week construction training (carpentry, framing, roofing) plus 10-week GED program. Structured Monday-Friday schedule with classroom and hands-on shop work. Graduates earn $43K+ average in union or entry-level positions.",
            "address": "935 Olson Memorial Hwy",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55405",
            "phone": "(612) 377-0150",
            "website": "https://saoic.org",
            "hours": "Mon-Fri 8:30am-2:50pm",
            "services": ["Construction Training", "GED Preparation", "Job Placement", "Career Certifications"],
            "latitude": 44.9830,
            "longitude": -93.2920,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want free hands-on construction training or need to get your GED.",
            "reentry_focused": True,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minneapolis Adult Education",
            "category": "education",
            "description": "Free GED prep, basic skills, and English language classes with flexible day and evening schedules. Self-paced learning with instructor support. Career pathway counseling included.",
            "address": "3225 Bloomington Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55407",
            "phone": "(612) 668-3800",
            "website": "https://mae.mpls.k12.mn.us",
            "hours": "Mon-Thu 8am-8pm, Fri 8am-4pm",
            "services": ["GED Preparation", "Basic Skills", "English Classes", "Career Pathways"],
            "latitude": 44.9384,
            "longitude": -93.2476,
            "serving_area": "Minneapolis",
            "good_fit_if": "You want flexible GED or skills classes you can fit around work or other responsibilities.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Saint Paul College",
            "category": "education",
            "description": "Community college with support services for students with barriers. Offers certificates, diplomas, and associate degrees. Financial aid office helps navigate grants and loans. Student support includes tutoring and advising.",
            "address": "235 Marshall Ave",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55102",
            "phone": "(651) 846-1600",
            "website": "https://saintpaul.edu",
            "hours": "Mon-Fri 7:30am-6pm",
            "services": ["Associate Degrees", "Certificates", "Financial Aid", "Student Support Services", "Tutoring"],
            "latitude": 44.9448,
            "longitude": -93.1052,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want to earn a college credential with support services to help you succeed.",
            "reentry_focused": False,
            "cost": "Financial aid available",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Literacy Minnesota",
            "category": "education",
            "description": "One-on-one tutoring and small group classes for reading, writing, and digital skills. Volunteer tutors matched to learners. Flexible scheduling at community locations across the metro.",
            "address": "700 Raymond Ave, Suite 180",
            "city": "St. Paul",
            "state": "MN",
            "zip_code": "55114",
            "phone": "(651) 251-9110",
            "website": "https://literacymn.org",
            "hours": "Mon-Fri 9am-5pm",
            "services": ["Adult Literacy", "One-on-One Tutoring", "Digital Skills", "English Classes"],
            "latitude": 44.9630,
            "longitude": -93.1950,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want personalized help improving reading, writing, or computer skills.",
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
            "description": "Food bank network with online food shelf locator covering all of Minnesota. Use website to find nearest pantry by zip code. Also provides SNAP application assistance through partner agencies.",
            "address": "7101 Winnetka Ave N",
            "city": "Brooklyn Park",
            "state": "MN",
            "zip_code": "55428",
            "phone": "(866) 844-3663",
            "website": "https://2harvest.org/find-food",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Food Shelf Locator", "SNAP Assistance", "Partner Food Pantries"],
            "latitude": 45.0913,
            "longitude": -93.3684,
            "serving_area": "Statewide",
            "good_fit_if": "You need to find a food shelf near you or want help applying for SNAP.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Loaves and Fishes",
            "category": "food",
            "description": "Free hot meals at 40+ dining sites across the Twin Cities. No ID or registration required. Community dining atmosphere with dignity-focused service.",
            "address": "1325 4th St SE",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55414",
            "phone": "(612) 377-9810",
            "website": "https://loavesandfishesmn.org",
            "hours": "Meal times vary by location",
            "services": ["Hot Meals", "Community Dining", "Multiple Locations", "No Registration Required"],
            "latitude": 44.9755,
            "longitude": -93.2303,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You want a hot meal in a welcoming setting with no questions asked.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Salvation Army Twin Cities",
            "category": "food",
            "description": "Food pantry plus emergency assistance for utilities, rent, and prescriptions. Walk-in service with brief intake. Also offers seasonal programs like holiday meals and back-to-school supplies.",
            "address": "2445 Prior Ave N",
            "city": "Roseville",
            "state": "MN",
            "zip_code": "55113",
            "phone": "(651) 746-3400",
            "website": "https://salvationarmynorth.org",
            "hours": "Mon-Fri 9am-4pm",
            "services": ["Food Pantry", "Utility Assistance", "Rent Help", "Holiday Programs"],
            "latitude": 45.0178,
            "longitude": -93.1549,
            "serving_area": "Twin Cities Metro",
            "good_fit_if": "You need food plus help with bills or other emergency needs.",
            "reentry_focused": False,
            "cost": "Free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hennepin County SNAP Office",
            "category": "food",
            "description": "SNAP (food stamps) enrollment and ongoing case management. Apply online, by phone, or in person. Benefits typically loaded within 30 days of approval; expedited service for emergencies.",
            "address": "525 Portland Ave",
            "city": "Minneapolis",
            "state": "MN",
            "zip_code": "55415",
            "phone": "(612) 596-1300",
            "website": "https://hennepin.us/snap",
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["SNAP Enrollment", "Application Assistance", "Case Management", "Expedited Benefits"],
            "latitude": 44.9738,
            "longitude": -93.2628,
            "serving_area": "Hennepin County",
            "good_fit_if": "You want to apply for SNAP benefits or need help with your existing case.",
            "reentry_focused": False,
            "cost": "Free to apply",
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
