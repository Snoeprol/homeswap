# Huisruil Platform Requirements

---

## User Stories

### 1. User Authentication & Profile Management

- **Sign Up / Login Page**
  - Users can create accounts using email, social login (Google, Facebook).
  - Fields required for sign up: 
    - Full Name
    - Email Address
    - Password (with password confirmation)
    - Profile Picture (optional)
    - Contact Information (phone number, email)
    - Address (home address, city, country)

- **Profile Page**
  - Users can edit their profile information.
  - Users can view their posted listings.
  - A user’s profile will include:
    - Name
    - Profile picture
    - Short bio
    - Contact information (email, phone)
    - Reviews (from previous swaps)

### 2. Landing Page

- A homepage that welcomes new and returning users.
- Calls to action:
  - “Browse Available Houses”
  - “List Your House”
  - “Login / Register”
  
- **Hero Section**: Showcase featured homes (images + descriptions).
- **Search Filters**:
  - Location (city, country)
  - Available Dates
  - House Size (number of rooms)
  - Swap Duration (short-term, long-term)

### 3. House Listings

- **Create Listing Page**:
  - Users can list their property by filling out a form.
  - Required fields:
    - Property Title (e.g., "Beautiful 2 Bedroom Apartment in Paris")
    - Property Description (detailed description including amenities, special features, house rules)
    - Address (visible only when a swap is confirmed)
    - Photos (multiple images of the property; limit to 5-10 images)
    - Number of Bedrooms
    - Number of Bathrooms
    - Maximum Guests
    - Available Dates (date picker for available swapping periods)
    - House Swap Preferences (e.g., family-friendly, pets allowed, non-smokers, etc.)
    - Amenities (checkboxes for things like Wi-Fi, parking, pool, air conditioning, etc.)
  - **Map Integration**: Show approximate location on a map (Google Maps API).
  
- **View Listing Page**:
  - Displays the detailed property listing.
  - Includes all the property details entered during listing creation.
  - Images displayed in a gallery format.
  - “Request a Swap” button for users to initiate a request.

### 4. Search & Filters

- Users can search for homes using various filters:
  - Location (city, country)
  - Dates (calendar picker)
  - Number of rooms
  - Amenities (checkbox for features like Wi-Fi, pool, pet-friendly)
  - Property Type (house, apartment, villa, etc.)
  
- **Search Results Page**:
  - Displays results in a grid format.
  - Each listing card should include:
    - Property image (main image)
    - Title (e.g., "Cozy Cottage in Ireland")
    - Location (city, country)
    - Basic details (number of rooms, bathrooms)
    - Availability dates
    - “Request a Swap” button
    
### 5. Messaging System

- **Inbox Page**:
  - Users can communicate with each other to discuss the details of their house swap.
  - Threads for each user interaction (house swap requests, negotiations, confirmations).
  - Unread messages should be clearly indicated.

- **Message Details**:
  - Each conversation will display:
    - Date & time of messages.
    - Ability to send text and images (optional, for sharing more property details).
    - Notification system for unread messages (optional email notifications).

### 6. House Swap Requests & Approvals

- Users can request a house swap by clicking the “Request a Swap” button on a listing.
- **Swap Request Form**:
  - Choose the dates for the swap.
  - Add a message to the host (optional).
  
- **Swap Request Management**:
  - Hosts can accept, decline, or negotiate swap requests.
  - Notifications sent to both parties for request status changes.

### 7. Rating and Reviews

- **Post-Swap Review System**:
  - After a swap is completed, users can leave reviews for each other.
  - Rating system (1-5 stars) based on cleanliness, communication, etc.
  - Written reviews (optional).

### 8. Administrative Pages

- **Admin Dashboard**:
  - Admin can manage listings, users, and reported issues.
  - Admin can deactivate problematic listings or users.
  
- **Content Moderation**:
  - Ability for users to report inappropriate content or problematic users.
  - Admins can review and take action based on user reports.

---

## UI/UX Considerations

- **Responsive Design**: Ensure the platform works seamlessly on desktop, tablet, and mobile devices.
- **Intuitive Navigation**: Use clean and simple navigation bars and buttons.
- **Image Gallery**: Implement a lightbox-style gallery for viewing property photos.
- **Loading Performance**: Optimize images and search performance for smooth user experience.

---

## Database Design

### Users Table

| Field          | Type      | Description                           |
|----------------|-----------|---------------------------------------|
| id             | Integer   | Primary Key                           |
| name           | String    | Full name of the user                 |
| email          | String    | User's email address                  |
| password       | String    | Encrypted password                    |
| profile_pic    | String    | URL to profile picture                |
| bio            | Text      | Short bio for user                    |
| contact_info   | Text      | Contact details (email, phone)        |
| address        | String    | User's address                        |

### Listings Table

| Field          | Type      | Description                           |
|----------------|-----------|---------------------------------------|
| id             | Integer   | Primary Key                           |
| user_id        | Integer   | Foreign key to Users table            |
| title          | String    | Title of the listing                  |
| description    | Text      | Detailed description of the property  |
| address        | String    | Address of the property               |
| num_bedrooms   | Integer   | Number of bedrooms                    |
| num_bathrooms  | Integer   | Number of bathrooms                   |
| max_guests     | Integer   | Maximum number of guests allowed      |
| images         | JSON      | JSON array storing image URLs         |
| available_dates| JSON      | JSON array storing available date ranges |
| amenities      | JSON      | JSON array storing amenities          |
| swap_prefs     | Text      | Preferences for the swap (e.g., no pets, family-friendly) |

### Messages Table

| Field          | Type      | Description                           |
|----------------|-----------|---------------------------------------|
| id             | Integer   | Primary Key                           |
| from_user_id   | Integer   | Foreign key to Users table (sender)   |
| to_user_id     | Integer   | Foreign key to Users table (recipient)|
| message_text   | Text      | Content of the message                |
| timestamp      | DateTime  | When the message was sent             |

### Reviews Table

| Field          | Type      | Description                           |
|----------------|-----------|---------------------------------------|
| id             | Integer   | Primary Key                           |
| listing_id     | Integer   | Foreign key to Listings table         |
| user_id        | Integer   | Foreign key to Users table            |
| rating         | Integer   | Star rating (1-5)                     |
| review_text    | Text      | Optional written review               |
| timestamp      | DateTime  | When the review was left              |

---
