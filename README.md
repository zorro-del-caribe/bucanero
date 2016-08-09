# Bucanero

[![CircleCI](https://circleci.com/gh/zorro-del-caribe/bucanero.svg?style=svg)](https://circleci.com/gh/zorro-del-caribe/bucanero)

Web framework for nodejs based on [koa.js](https://koajs.com), using convention over configuration and inspired by [actionHero]()

## install

``npm install bucanero``

## usage

```Javascript
const bucanero = require('bucanero');

const app = bucanero(options={});

app
    .start()
    .then(app => {
      // app listening
      return app.stop();
    })
    .then(()=>{
      // app has been stopped
    });
```

## structures

### initializers

### config

### controllers

## examples

* web application

* api



