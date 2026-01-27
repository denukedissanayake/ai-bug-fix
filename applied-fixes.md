## Applied Security Fixes

### Package Changes
```diff
7,12c7,10
<     "react": "^17.0.2",
<     "react-dom": "^17.0.2",
<     "react-router-dom": "^6.0.0",
<     "express": "^4.17.1",
<     "sqlite3": "^5.0.2",
<     "jsonwebtoken": "^8.5.1",
---
>     "axios": "^1.12.2",
>     "bcrypt": "^5.0.1",
>     "body-parser": "^1.19.0",
>     "concurrently": "^6.3.0",
15,16c13,15
<     "body-parser": "^1.19.0",
<     "axios": "^0.24.0",
---
>     "express": "^4.17.1",
>     "express-session": "^1.17.2",
>     "jsonwebtoken": "^9.0.2",
17a17,20
>     "multer": "^2.0.2",
>     "react": "^17.0.2",
>     "react-dom": "^17.0.2",
>     "react-router-dom": "^6.0.0",
19,22c22
<     "express-session": "^1.17.2",
<     "bcrypt": "^5.0.1",
<     "multer": "^1.4.3",
<     "concurrently": "^6.3.0"
---
>     "sqlite3": "^5.0.2"
25a26
>     "@babel/plugin-transform-runtime": "^7.28.3",
27a29
>     "@babel/runtime": "^7.28.4",
28a31,33
>     "css-loader": "^6.2.0",
>     "html-webpack-plugin": "^5.3.2",
>     "style-loader": "^3.2.1",
31,34c36
<     "webpack-dev-server": "^4.2.1",
<     "html-webpack-plugin": "^5.3.2",
<     "css-loader": "^6.2.0",
<     "style-loader": "^3.2.1"
---
>     "webpack-dev-server": "^5.2.2"
54c56
< }
\ No newline at end of file
---
> }
```
