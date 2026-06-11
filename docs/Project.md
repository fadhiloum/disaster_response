# Disaster Response Platform — MVP Product Spec

## Goal

Build a web app that helps emergency responders coordinate incidents, needs, resources, volunteers, shelters, and situation reports in real time.

## Target Users

* Incident Commander / Coordinator
* Field Responder
* NGO / Partner Organization
* Volunteer Manager
* Logistics Officer
* Public Information Officer
* Admin

## Core MVP Features

### 1. Incident Dashboard

Show a common operating picture:

* Active incidents
* Severity level
* Location map
* Affected population estimate
* Open needs
* Assigned teams
* Resource gaps
* Latest situation updates

### 2. Incident Management

Users can create and manage incidents with:

* Title
* Disaster type: flood, earthquake, landslide, fire, storm, conflict, other
* Location
* Start date/time
* Severity
* Status: monitoring, active, stabilizing, closed
* Description
* Attachments/photos
* Geo-coordinates

### 3. Needs Assessment

Field responders can submit needs:

* Food
* Water
* Shelter
* Medical
* WASH
* Search and rescue
* Logistics
* Protection
* Other

Each need has:

* Location
* Quantity
* Urgency
* Number of people affected
* Notes
* Status: reported, verified, assigned, fulfilled, closed

### 4. Resource & Inventory Tracking

Track available and requested resources:

* Item name
* Category
* Quantity available
* Quantity committed
* Warehouse/location
* Expiry date, if relevant
* Assigned incident
* Movement history

### 5. Task Assignment

Coordinators can assign tasks to responders:

* Task title
* Incident
* Location
* Assignee
* Priority
* Due time
* Status: todo, in progress, blocked, done
* Comments

### 6. Partner 3W Coordination

Track “Who does What Where”:

* Organization
* Sector
* Activity
* Location
* Contact person
* Start/end date
* Current status

### 7. Situation Reports

Generate simple SitReps from incident data:

* Summary
* Current impact
* Priority needs
* Response actions
* Gaps
* Next operational period priorities

### 8. Map View

Display:

* Incident points
* Needs reports
* Shelters
* Warehouses
* Assigned teams
* Road closures or hazards, if available

### 9. Role-Based Access

Roles:

* Admin: full access
* Coordinator: manage incidents, tasks, resources, reports
* Responder: create updates, needs, task status
* Partner: update own 3W activities
* Viewer: read-only dashboard

## Suggested Tech Stack

* Frontend: Next.js + React + Tailwind CSS
* Backend: Next.js API routes or FastAPI
* Database: PostgreSQL + PostGIS
* Auth: NextAuth or Supabase Auth
* Maps: Mapbox, Leaflet, or Google Maps
* File storage: S3-compatible storage or Supabase Storage
* Deployment: Vercel + managed Postgres

## Core Data Models

### User

* id
* name
* email
* role
* organization_id
* created_at

### Organization

* id
* name
* type
* contact_email
* phone
* address

### Incident

* id
* title
* disaster_type
* severity
* status
* description
* latitude
* longitude
* location_name
* start_time
* created_by
* created_at
* updated_at

### NeedReport

* id
* incident_id
* category
* urgency
* quantity
* affected_people
* status
* latitude
* longitude
* location_name
* notes
* reported_by
* verified_by
* created_at

### Resource

* id
* name
* category
* quantity_available
* quantity_committed
* unit
* warehouse_location
* expiry_date
* created_at

### Task

* id
* incident_id
* title
* description
* assignee_id
* priority
* status
* due_time
* latitude
* longitude
* created_by
* created_at

### PartnerActivity

* id
* organization_id
* incident_id
* sector
* activity
* location_name
* latitude
* longitude
* status
* contact_name
* contact_phone
* start_date
* end_date

### SituationReport

* id
* incident_id
* reporting_period_start
* reporting_period_end
* summary
* impact
* priority_needs
* response_actions
* gaps
* next_priorities
* created_by
* created_at

## API Endpoints

### Auth

* POST /api/auth/login
* POST /api/auth/logout
* GET /api/me

### Incidents

* GET /api/incidents
* POST /api/incidents
* GET /api/incidents/:id
* PATCH /api/incidents/:id
* DELETE /api/incidents/:id

### Needs

* GET /api/incidents/:id/needs
* POST /api/incidents/:id/needs
* PATCH /api/needs/:id

### Resources

* GET /api/resources
* POST /api/resources
* PATCH /api/resources/:id
* POST /api/resources/:id/commit

### Tasks

* GET /api/incidents/:id/tasks
* POST /api/incidents/:id/tasks
* PATCH /api/tasks/:id

### Partner Activities

* GET /api/incidents/:id/activities
* POST /api/incidents/:id/activities
* PATCH /api/activities/:id

### Situation Reports

* GET /api/incidents/:id/sitreps
* POST /api/incidents/:id/sitreps
* GET /api/sitreps/:id/export

## UI Pages

### /dashboard

Overview of active incidents, needs, gaps, and tasks.

### /incidents

List and filter incidents.

### /incidents/new

Create incident form.

### /incidents/[id]

Incident detail page with tabs:

* Overview
* Map
* Needs
* Tasks
* Resources
* Partners
* Situation Reports

### /resources

Inventory and logistics view.

### /map

Full-screen operational map.

### /sitreps

List of situation reports.

### /admin

User, role, and organization management.

## MVP Acceptance Criteria

* Users can log in with role-based permissions.
* Coordinators can create and update incidents.
* Responders can submit needs with map locations.
* Coordinators can assign tasks and update task status.
* Resources can be tracked and committed to incidents.
* Partner activities can be recorded using 3W format.
* Dashboard shows active incidents, urgent needs, and open tasks.
* Map displays incidents, needs, resources, and activities.
* SitRep can be generated and exported as text or PDF.
* App is usable on mobile and desktop.

## Nice-to-Have Features After MVP

* Offline-first mobile mode
* SMS/WhatsApp alerts
* AI-assisted SitRep drafting
* Damage assessment photo upload
* Duplicate need detection
* Volunteer registration
* Shelter occupancy tracking
* Public-facing information page
* Multi-language support
* Integration with HDX or government open data

## Build Instructions for Codex

Create a full-stack disaster response coordination app using Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma. Implement authentication, role-based access, CRUD for incidents, needs, tasks, resources, partner activities, map visualization, and situation report generation. Prioritize clean UI, mobile responsiveness, data validation, and clear separation between frontend components, API routes, and database models.
