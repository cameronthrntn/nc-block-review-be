# NC-NEWS
A simple news/article site/API built as a result of the backend 'block-review' on the sixth week of the NorthCoders training course. The purpose of building this was as a means of examining the skills that had been learned throughout my time on the course. A descrition of the various endpoints and methods can be found in a JSON format on 'GET /api'.

## Hosted:
 <https://shubwub-nc-news.herokuapp.com/api>

## Getting Started
This project is built using node.js with express and postgres. As a result these packages **must**to be insalled.

1. Installing dependancies:
  ```bash
    npm i 
  ```
2. Once dependancies are installed the Databases must be established:
  ```bash
    npm run setup-dbs
  ```

3. After the databases have been created, update them to the latest migrations:
  ```bash
    npm run mg-latest
  ```
4. **ONLY** Should you need to rollback any changes:
  ```bash
    npm run mg-rb
  ```
5. Now the tables are set up, they will need to be seeded:
  ```bash
    npm run seed-dev
  ```
6. Once the database is setup and seeded, the server can be started on port 9090:
  ```bash
    npm run start
  ```

**For testing, simply run ``` npm t ``` and the database will be rolled forward and back between each test**