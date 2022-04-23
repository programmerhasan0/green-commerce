# GREEN COMMERCE

**_Green Commerce_** is a e-commerce website which I created when I was learning Node.js and MongoDB. Some informations about this website is writen below.

- **ExpressJS** has been used as the main framework.
- Used **MVC** design pattern/Architecture
- Used **EJS** for view.
- **MongoDB** has been used as a Database via **Mongoose**.
- **Bcryptjs** has been used for hasing the passwords.
- **connect-flash** has been used for flashing errors and login related exceptions.
- Used **multer** for parsing "multipart/form-data"
- Used **express-validator** for making the server side validation simple and easy.
- Used **nodemailer** for sending emails
- Used **csurf** for avoiding the cross site request forgery

### Database Architecture :

_**NOTE DOWN:** This e-commerce shop is an multivendor ecommerce shop so any user also can be a seller if s/he want to_

**The Database has 4 collections**
<br>

- users
- products
- orders
- sessions

**users** schema configuration :
<br>
|\_id|email|password|cart
|-|-|-|-|
|ObjectId('626275df673eee17346d4120')|programmerhasan0@gmail.com|$2a$12$Rv3ZiPjJkX1oJ8IxTdxvp.NIh9aEd9rHCasEfCdoLEROhufW|`{items : []}`|

**products** schma configuration :
|\_id|title|price|description|imageUrl|userId|
|-|-|-|-|-|-|
|ObjectId('626275f9673eee17346d4121')|Green Apples|25|These are green apples|images\1650619897095_applestn111613997840.jpg|ObjectId('626275df673eee17346d4120')|
|ObjectId('626389232558f342e4584870')|Blue Berry Juice|16.99|This is made from original blue berries of Poland|images\1650690339424_The-Berry-Company-Blueberry-Juice-Drink-1Litre-738769-01.jpg|626275df673eee17346d4120|

**_MD HABIBUL HASAN_**
<br>
Software Developer and Enthusiast
<br>
programmerhasan0@gmail.com
<br>
[Linkedin](https://www.linkedin.com/in/programmerhasan0/) [GitHub](https://github.com/programmerhasan0/) [Facebook](https://www.facebook.com/programmerhasan0/) [Twitter](https://twitter.com/devhasan0)
