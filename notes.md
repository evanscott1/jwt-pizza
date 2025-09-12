# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | homes.tsx | _none_ | _none_ |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx | [POST] /api/auth | `INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/> `INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)` |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx | [PUT] /api/auth | `SELECT * FROM user WHERE email=?` <br/> `SELECT * FROM userRole WHERE userId=?` <br/> `INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token` |
| Order pizza                                         | menu.tsx | [GET] api/order/menu <br> [POST] api/order |              |
| Verify pizza                                        | dinerDashboard.tsx | [GET] api/order |              |
| View profile page                                   | dinerDashboard.tsx | [GET] api/user/me                  |              |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx | [GET] api/franchise/:userID  |              |
| Logout                                              | logout.tsx | [DELETE] api/auth |              |
| View About page                                     | about.tsx | _none_ | _none_ |
| View History page                                   | history.tsx | _none_ | _none_ |
| Login as franchisee<br/>(t@jwt.com, pw: franchisee) | login.tsx | [PUT] /api/auth |              |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx | [GET] api/franchise/:userID |              |
| Create a store                                      | createStore.tsx | [POST] api/franchise/:franchiseId/store |              |
| Close a store                                       | closeStore.tsx | [DELETE] api/franchise/:franchiseID/store/:storeId |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx | [PUT] /api/auth |              |
| View Admin page                                     | adminDashboard.tsx | [GET] api/franchise |              |
| Create a franchise for t@jwt.com                    | createFranchise.tsx | [POST] api/franchise |              |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | [DELETE] api/franchise |              |
