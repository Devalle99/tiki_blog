# Tiki Blog

This is an API for a blogging platform using the Express framework, along with Passport to handle authentication, Joi for request validation, Jest and Supertest for testing, and MongoDB and Mongoose for the database and document schemas respectively.

This is a personal blogging platform, so there is only one author. However, users can signup to leave a comment or like articles. There is an admin panel for site management as well.

Articles can either have a "draft" or a "published" status. If the author wants to hide an article, he should change its status to "draft".

## Core features and user actions:

### Account

-   Users can signup, login, logout, and delete their account. Users don't have a public profile page to land into.

### Article-related actions, for the Author

-   Create an article
-   Edit and delete an article
-   List his articles and manage them

### Article-related actions, for Users

-   View the main feed
-   Search for articles by title
-   Search for tags, which then point to associated articles
-   Read articles, give them a like or comment on them

### Other actions

-   Unlike an article
-   Edit and delete a comment
-   View the author's bio page

## Design notes:

### Use cases for listing articles

-   As an author, listing my own articles so as to manage them
    -   Retrieve articles with any status ("draft" or "published")
    -   Filter by status and title
    -   Sort by publication date (asc or desc)
    -   Support pagination
    -   `/author/articles`
-   As a regular user or visitor, for the main feed
    -   Only articles with "published" status
    -   Filter by title
    -   Sort by relevance (desc) or by publication date (asc or desc)
    -   Support pagination
    -   `/articles`
-   As a regular user, listing the articles associated with a specific tag
    -   Only articles with "published" status
    -   Sort by relevance
    -   `tags/tagID/articles`

### Use cases for retrieving a single article

-   As a regular user, opening an article to read it
    -   `/articles/articleID`
-   As an author, opening an article to edit it
    -   `/author/articles/articleID`
