const net = require('net');
const dns = require('dns');

module.exports = function(config) {
  var trustedIps;
  var dnsEntry;

  if (config === false) {
    trustedIps = new Set([]);
    dnsEntry = false;
  } else if (net.isIPv4(config) || net.isIPv6(config)) {
    trustedIps = new Set([ config ]);
    dnsEntry = false;
  } else {
    trustedIps = new Set([]);
    dnsEntry = config;
  }

  function validateAndNext(trusted, req, next) {
    if (!trusted) {
      //express use defineGetter or defineProperty.
      //We need to reconfigure
      Object.defineProperty(req, 'host', {
        writable:     false,
        configurable: true,
        enumerable:   true,
        value: req.headers.host
      });
    }

    next();
  }

  return function(req, res, next) {
    if (typeof req.headers['x-forwarded-host'] === 'undefined') {
      return next();
    }

    if (config === false) {
      return validateAndNext(false, req, next);
    }

    const trusted = req.ips.some(ip => trustedIps.has(ip));

    if (!trusted && dnsEntry) {
      //if is not trusted yet
      //fetch the ip addresses and check
      return dns.resolve(dnsEntry, (err, ips) => {
        if (err) { return next(); }
        trustedIps = new Set(ips);
        const trusted = req.ips.some(ip => trustedIps.has(ip));
        validateAndNext(trusted, req, next);
      });
    }

    validateAndNext(trusted, req, next);
  };
};
