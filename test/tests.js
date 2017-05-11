const trustforwardedhost = require('./..');
const assert = require('chai').assert;
const dns = require('dns');

function mockrequest(ips, host, forwardedHost) {
  const request = {
    headers: {
      'host': 'main.example.com'
    },
    ips: ips,
    ip: ips[0]
  };

  if (forwardedHost) {
    request.headers['x-forwarded-host'] = forwardedHost;
  }

  Object.defineProperty(request, 'host', {
    configurable: true,
    enumerable: true,
    get: () => forwardedHost || host
  });

  return request;
}


describe('trustforwardedhost', function () {

  describe('when trusting an ip address', function() {
    const tfh = trustforwardedhost('2.2.2.2');

    it('should do nothing if header is not present', function(done) {
      const request = mockrequest(['2.2.2.2'], 'main.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'main.example.com');
        done();
      });
    });

    it('should remove the header if it is untrusted', function(done) {
      const request = mockrequest(['19.20.21.22', '1.2.3.4'],
                                  'main.example.com',
                                  'fake.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'main.example.com');
        done();
      });
    });


    it('should not remove the header if it is trusted', function(done) {
      const request = mockrequest(['19.20.21.22', '2.2.2.2'],
                                  'main.example.com',
                                  'forwarded.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'forwarded.example.com');
        done();
      });
    });
  });


  describe('when trusting a domain name', function() {
    const tfh = trustforwardedhost('example.com');
    var ip;

    before((done) => {
      dns.resolve('example.com', 'A', (err, ips) => {
        if (err) { return done(err); }
        ip = ips[0];
        done();
      });
    });

    it('should do nothing if header is not present', function(done) {
      const request = mockrequest(['2.2.2.2'], 'main.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'main.example.com');
        done();
      });
    });

    it('should remove the header if it is untrusted', function(done) {
      const request = mockrequest(['19.20.21.22', '1.2.3.4'],
                                  'main.example.com',
                                  'fake.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'main.example.com');
        done();
      });
    });


    it('should not remove the header if it is trusted', function(done) {
      const request = mockrequest(['19.20.21.22', ip],
                                  'main.example.com',
                                  'forwarded.example.com');

      tfh(request, null, () => {
        assert.notProperty(request, 'x-forwarded-host');
        assert.equal(request.host, 'forwarded.example.com');
        done();
      });
    });

  });


});
