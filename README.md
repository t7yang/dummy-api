# Local DummyJSON API

This is a Node.js API service that run locally for learning purpose. The Learner can run it locally and perform CRUD to update the data.

Many thanks to [DummyJSON](https://github.com/Ovi/DummyJSON) for making such a great learning resource publicly available.

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
- All APIs below should prefix with `/api`, for example, `/api/auth/profile`.

Resources:

- /auth
  - POST /login - the session last for 24 hours
    - request payload: `{ username: string; password: string }`
  - POST /logout
  - GET /profile - get the current logged in user's profile
    - response payload: `User` 
- /cart
  - GET /:id
    - resposne payload: `Cart`
  - GET /my - get current logged-in user's cart
    - resposne payload: `Cart | null`
  - POST /
    - requst payload: `{ products: number[] }`
    - resposne payload: `Cart`
  - PUT /:id
    - request payload: same as POST
    - resposne payload: `Cart`
  - DELETE /:id
    - resposne payload: `Cart`
- /product
  - GET /autocomplete-list
    - response payload: `{ brand: string[]; category: string[] }`
  - GET /:id
    - resposne payload: `Product`
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
    - resposne payload: `{ products: Product[]; total: number }`
- /todo
  - GET /:id
    - resposne payload: `Todo`
  - GET /
    - request query:
      - completed?: `'true' | 'false'`
    - resposne payload: `{ todos: Todo[]; total: number }`
  - POST /
    - request payload: `Pick<Todo, 'todo' | 'completed' | 'userId'>`
    - resposne payload: `Todo`
  - PUT /:id
    - request payload: `Pick<Todo, 'todo' | 'completed'>`
    - resposne payload: `Todo`
  - DELETE /:id
    - resposne payload: `Todo`
  - DELETE /
    - request query:
      - completed?: `'true' | 'false'`
    - resposne payload: `Todo[]`
- /user
  - GET /:id
    - resposne payload: `User`
  - GET /
    - resposne payload: `{ users: User[]; total: number }`
