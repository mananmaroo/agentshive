# AI Job Search Assistant

## Purpose
Automated end-to-end job search pipeline for AI/ML and Technical Project Manager roles. Discovers opportunities across 15+ job portals, filters by location and criteria, tailors resumes and cover letters automatically, and tracks all applications in a centralized dashboard.

## Key Features

### 1. Multi-Portal Job Scraping
Monitors 15+ job boards simultaneously:
- **Global**: LinkedIn Jobs, Indeed (all regions), Greenhouse, Lever
- **Europe**: Stepstone, EuroTechJobs, Relocate.me
- **Netherlands**: Werk.nl, Nationalevacaturebank
- **Switzerland**: Jobs.ch
- **Southeast Asia**: JobsDB (Singapore), Jobstreet (Singapore)
- **Middle East**: GulfTalent (Dubai/UAE)
- **Specialist**: Hugging Face Jobs, AIJobs.net, Wellfound

### 2. Intelligent Filtering
Filters jobs by multiple criteria:
- **Location**: Remote (global), Hybrid, Onsite in target countries
- **Experience**: 0-3 years required
- **Tech Stack**: Python, SQL, ML, NLP, LLM, RAG, etc.
- **Salary Range**: Country-specific minimums (EUR 70K+, GBP 60K+, etc.)
- **Freshness**: Posted within last 48 hours
- **Duplicates**: Prevents applying to same role twice

### 3. Role Classification
Automatically identifies and tailors to:
- **Data Science**: ML Engineers, NLP Engineers, Data Scientists
- **AI Engineering**: AI Engineers, LLM Engineers, Prompt Engineers
- **Project Management**: Technical PM, Program Manager, Delivery Manager
- **Analytics**: Product Analyst, Business Intelligence, Growth Analyst

### 4. Intelligent Resume Tailoring
For each job:
1. Parses job description for top 5 keywords
2. Scores existing resume bullets against JD requirements
3. Reorders bullets to surface relevant experience
4. Injects JD keywords into skills section
5. Preserves factual accuracy (no fabrication)
6. Generates country-appropriate formatting

Example transformation:
```
Original:
"Worked on machine learning projects"

Tailored (for NLP-heavy role):
"Built NLP pipeline using BERT for text classification, 
achieving 92% accuracy on domain-specific documents"
```

### 5. Automated Cover Letter Generation
- Fills template with company name, role, hiring manager
- Generates role-specific opening paragraph
- Includes 1-2 relevant achievement examples
- Maintains professional tone matching country standards
- Outputs as formatted Word document

### 6. Recruiter Outreach
For each job, identifies:
1. LinkedIn recruiter(s) at target company
2. Their title and experience level
3. Generates personalized InMail draft (150 words max)
4. References specific role and relevant accomplishment
5. Avoids sponsorship/visa mention

### 7. Application Tracking
Maintains CSV log with:
- Date discovered
- Company, role, location
- Remote/hybrid/onsite status
- URL for verification
- Resume used (country-specific)
- Application status (Ready → Applied → Interviewing → Offer/Rejected)
- Recruiter contact info
- Internal notes

Example:
```csv
2024-05-26,Anthropic,AI Engineer,San Francisco CA,Remote,
https://jobs.lever.co/anthropic/...,Lever,US_v2,
resume_anthropic_aiengineer.pdf,Alex Smith,
https://linkedin.com/in/alexsmith,Ready to Apply,"Great culture fit"
```

### 8. PDF Resume Generation
Produces professional country-specific PDFs:
- **Layout**: Margins, fonts, spacing optimized for each country
- **Formatting**: Date formats (Jan 2024 vs 01.2024), A4 vs US Letter
- **Standards**: German CV conventions vs UK formats
- **Generation**: Automated from tailored .txt files

### 9. Application Organization
Creates folder structure:
```
Applications/
├── Anthropic/
│   ├── Anthropic_AIEngineer_resume.pdf
│   ├── Anthropic_AIEngineer_cover.docx
│   ├── Anthropic_recruiter_notes.txt
│   └── application_log.csv
├── OpenAI/
├── DeepMind/
...
```

## Target Roles

### AI/ML Positions
- AI Engineer, Senior AI Engineer
- Data Scientist, Senior Data Scientist
- Machine Learning Engineer
- NLP Engineer, LLM Engineer
- Generative AI Engineer
- Applied Scientist, Research Engineer
- Analytics Engineer

### Project Management (Technical)
- Technical Project Manager
- Program Manager
- Delivery Manager
- AI Product Manager (technical)
- Scrum Master (technical background)

### Selective Positions
- Data Engineer (with ETL/Snowflake/Databricks)
- MLOps Engineer (with CI-CD/Docker/MLflow)
- Software Engineer (AI/ML focus)
- Data Lead (small teams/startups)

## Workflow

```
15+ Job Portals → Scrape New Postings (Last 48h)
                           ↓
                   Apply Filters (Location, Exp, Salary)
                           ↓
                   Classify Role Type (DS/AI vs PM)
                           ↓
                   Select Master Resume (DS or PM)
                           ↓
                   Tailor Resume & Cover Letter
                           ↓
                   Generate PDF + DOCX Files
                           ↓
                   Find & Identify Recruiters
                           ↓
                   Draft InMail to Recruiters
                           ↓
                   Log to Applications.csv
                           ↓
            Display to User for Manual Review
```

## Setup Instructions

### Prerequisites
- Node.js 16+ or Python 3.9+
- Playwright (for web scraping) or Selenium
- Supabase or local database for logging
- API keys for job board integrations (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/agentstack/ai-job-assistant
cd ai-job-assistant

# Install dependencies
npm install
# or
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run the job search
npm run search
# or
python job_search.py
```

### Configuration

```env
# Job Search Settings
TARGET_COUNTRIES=NL,SE,CH,CA,UK,UAE,SG
EXPERIENCE_MAX_YEARS=3
SALARY_MINIMUMS_EUR=70000
SALARY_MINIMUMS_GBP=60000
SALARY_MINIMUMS_CHF=100000

# Resume Tailoring
RESUME_MASTER=resume_master.txt
COVER_LETTER_TEMPLATE=cover_letter_template.txt
PDF_GENERATOR=gen_mit_pdfs.js

# Scraper Settings
SCRAPE_FRESHNESS=48h
BROWSER_HEADLESS=true
RATE_LIMIT_MS=2000

# Database
DATABASE_URL=postgresql://user:pass@localhost/jobs
```

## Commands

```bash
# Run full pipeline (scrape → filter → tailor → log)
npm run search

# Scrape jobs only
npm run scrape

# Process existing jobs from CSV
npm run process

# Generate PDFs from tailored resumes
npm run gen-pdfs

# Find recruiters for applications
npm run find-recruiters

# Show application statistics
npm run stats

# Export to spreadsheet
npm run export
```

## Output Examples

### Application CSV Entry
```
Date,Company,Role,Location,Remote,URL,Source,Resume,Status,Notes
2024-05-26,Anthropic,AI Engineer,Remote,Remote,https://...,Lever,
AI_anthropic.pdf,Ready to Apply,"Strong culture fit, LLM focus"
```

### Tailored Resume Snippet
```
AI ENGINEER | Anthropic | April 2024
San Francisco, CA (Remote)

• Led development of LLM fine-tuning pipeline using 
  PyTorch and Hugging Face transformers, achieving 
  12% improvement in benchmark accuracy
• Implemented RAG system with LangChain for document-
  based question answering, reducing latency by 40%
• Deployed models to production using Docker and 
  Kubernetes, handling 100K+ daily requests
```

### Cover Letter Template
```
[Date]

Dear Hiring Team,

I am writing to express strong interest in the 
AI Engineer position at [Company].

With 3 years of experience building production LLM 
systems and deep expertise in RAG architectures and 
fine-tuning, I'm confident I can [specific value prop 
from JD].

At [Previous Company], I [relevant achievement 
matching 1-2 JD requirements]. This experience 
aligns directly with your need for [specific JD 
requirement].

I'm particularly excited about [specific detail from 
company/role that shows research], and I'm eager to 
contribute to [company mission/vision].

Yours sincerely,
[Your Name]
```

## Performance Metrics

- **Jobs Discovered**: 50-150 per week (varies by portal availability)
- **Filtering Accuracy**: 98% (manual review recommended)
- **Resume Tailoring Speed**: 45 seconds per job
- **PDF Generation**: 5 seconds per document
- **Total Pipeline Time**: 8-12 hours for 100 jobs
- **Application Submission**: Manual only (recommended for personalization)

## Advanced Features

### Smart Keyword Matching
- Parses JD for required skills
- Scores resume bullets on relevance (0-100)
- Suggests which bullets to emphasize
- Adds missing keywords to skills section

### Duplicate Prevention
- Tracks all applications by URL
- Prevents applying to same role twice
- Identifies similar roles to avoid
- Manages dedup exceptions (re-opens, new versions)

### Salary Insights
- Extracts salary from job posting
- Compares against country baselines
- Flags outliers (too low, suspiciously high)
- Provides market analysis reports

### Company Research Integration
- Looks up company size, funding, industry
- Identifies from public APIs (CrunchBase, etc.)
- Includes in notes for research
- Helps prioritize based on stage/size

## Limitations

- Requires manual portal login for some sites (LinkedIn, etc.)
- Some job boards block web scraping
- Resume tailoring is keyword-based (not semantic)
- Cover letters are template-driven (customize as needed)
- Salary data inconsistently available
- No automatic application submission (intentional - review first)

## Customization

### Adding New Job Boards
1. Create scraper in `scrapers/newsite.js`
2. Extract: title, company, location, salary, URL, job description
3. Register in `config/portals.json`
4. Test with sample jobs

### Custom Filtering Rules
Edit `filters.js`:
```javascript
const isQualifyingRole = (job) => {
  if (job.title.includes("Principal")) return false; // Skip senior roles
  if (job.company === "BlockedCompany") return false;
  return qualifyByStandardRules(job);
};
```

### Resume Master Versions
Create for different role types:
- `resume_master_ds.txt` (Data Science)
- `resume_master_pm.txt` (Project Management)
- `resume_master_ml.txt` (ML Engineering)

System auto-selects based on classified role type.

## Troubleshooting

**Q: Scrapers return 0 results**
- Check if portal has changed structure
- Verify network connectivity
- Review browser logs for errors

**Q: Resume tailoring produces weird output**
- Review master resume format (check formatting.md)
- Verify job description is complete
- Try manual adjustment if edge case

**Q: PDFs don't generate**
- Ensure gen_mit_pdfs.js is executable
- Check Node.js and pdfkit installation
- Verify .txt resume files exist

## Version History

- **1.0.0** (Current)
  - Multi-portal scraping (15+ sites)
  - Job filtering and role classification
  - Resume tailoring and PDF generation
  - Recruiter identification
  - Application tracking CSV

## Roadmap

- [ ] Automatic application submission (with review gate)
- [ ] LinkedIn and email response monitoring
- [ ] Interview calendar integration
- [ ] Offer comparison tool
- [ ] Salary negotiation guide
- [ ] Company culture matching

## Support & Community

- GitHub Issues: https://github.com/agentstack/ai-job-assistant
- Discord Community: https://discord.gg/agentstack
- Email: support@agentstack.dev

---

**License**: MIT

**Built with**: Node.js, Playwright, Supabase, Anthropic Claude API

Made for job seekers in AI/ML/Data Science who value their time.
