# Lettus-Grow

This package contains the main server for Lettus Grow.


## Technologies

* First and foremost: `node`. This is server side Javascript.
* `express`: Runs on top of node and provides lots of useful functionalities.
* `passport`: A middleware for authenticating the logins.
* `mongoDB`: A NoSQL database. Basically query it and it gives you JSON back.
* `monk`: This works on top of MongoDB to provide easy functionality.
* `pug`: (Formally called `Jade`) This is a template language for HTML. This is what we use when we call `res.render()`
* `sass`: An extension of CSS that compiles to CSS.
* `combodate`: An easy way to have HTML <select> blocks for dates.
* `uuid`: Create UUIDs for the pots.


## Installation

* Download node, which automatically gives you npm, a package manager: https://nodejs.org/en/download/
* Next you need to get bower, another package manager: `npm install -g bower`
* The files `bower.json` and `package.json` contain the dependancies for the application. To install them we use the commands `npm install`, followed by `bower install`
* Next you will need to install MongoDB: https://www.mongodb.com/download-center. I'm not particularly familiar with MongoDB, but it's fairly easy to get running. First, create a new folder called `data` at the root of this directory. Once you have downloaded MongoDB you should have lots of applications in its `bin` folder. The one we're interested in is `mongod`. In a new command window, type `[path/to/mongod] --dbpath [/route/to/data]`. This will create a running database that basically acts like a locally hosted server, available at the port 27017.
* If you are editing a SASS file, it's best to open a new tab from the root of this directory and type `sass --watch sass:public/css`, which will automatically update the public CSS files as your update the SASS.
* If all is going well, run the application with `node app.js`. This just creates a locally hosted version of the server, only available from the computer running it.