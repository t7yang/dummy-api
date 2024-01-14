# Local DummyJSON API

This is a Node.js API service that run locally for learning purpose. The Learner can run it locally and perform CRUD to update the data.

## Usage

- Clone this repo.
- Run `npm install` to install the dependencies.
- Run `npm run db:seed` to fetch the data from DummyJSON.
- Run `npm run start` to start the API service.
- Test the API on `http://localhost:4000`.

## APIs

Common:

- For the complete data model, please check `src/model/*/type.ts` or check the `.db.json` (after run `npm run db:seed`).
- Each GET / API has an optional `?skip=number&limit=number` query pair to control how many items to retrieve, default is `skip=0&limit=12`.
- Each request should contains the session cookie, to skip the auth guard, you can request with `?auth=0`.
- To properly test the APIs, you can create an index.html in the public folder and then use the `fetch` to request the APIs.

Resources:

- /auth
  - POST /login - the session last for 24 hours
    - request payload: `{ username: string; password: string }`
  - POST /logout
  - GET /profile - get the current logged in user's profile
    - response payload: `User` 
- /cart
  - GET /:id
  - GET /user/:id - get specific user's cart
  - POST /
    - requst payload: `{ userId: number; products: number[] }`
  - PUT /:id
    - request payload: same as POST
  - DELETE /:id
- /product
  - GET /:id
  - GET /
    - request query:
      - keyword?: keyword in title or description (multiple)
      - brand?: product's brand (multiple)
      - category?: product's category (multiple)
      - minPrice?: minimum price
      - maxPrice?: maximum price
      - minDiscount?: minimum discount percentage
      - maxDiscount?: maximum discount percentage
      - minRating?: minimum rating
      - maxRating?: maximum rating
- /todo
  - GET /:id
  - GET /
    - request query:
      - completed?: `'true' | 'false'`
      - userId?: `number`
  - POST /
    - request payload: `Pick<User, 'todo' | 'completed' | 'userId'>`
  - PUT /:id
    - request payload: `Pick<User, 'todo' | 'completed' | 'userId'>`
  - DELETE /:id
  - DELETE /
    - request query:
      - completed?: `'true' | 'false'`
      - userId?: `number`
- /user
  - GET /:id
  - GET /
