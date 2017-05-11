This is an expressjs middleware to validate the X-Forwareded-Host header.

It allows you to trust this header based on the proxies running on top of your application. It is specially useful when you trust the `X-Forwarded-For` header sent by two different proxies but you want to only allow `X-Forwarded-Host` from one of them.

## Usage


```javascript
const tfh = require('trustforwardedhost');

app.set('trust proxy', true);

app.use(tfh('10.0.0.1'));
```

In this example, if the list of valid ips (req.ips) doesn't include `10.0.0.1` the `X-Forwarded-Host` header will be discarded. The middleware assumes that this proxy should not sent this header. `req.host` will equals to `req.headers.host`.


If your application is running behind an autoscaled load balancer it might be useful to define the trust with a DNS entry:

```javascript
const tfh = require('trustforwardedhost');

app.set('trust proxy', true);

app.use(tfh('my-loadbalancer.company.com'));
```

## install


```
npm i auth0/trustforwardedhost
```
