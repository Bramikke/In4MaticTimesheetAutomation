(function (xhr) {
  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = new Date().toISOString();

    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function (header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function (postData) {
    this.addEventListener('load', function () {
      if (
        this._url.includes('/api/selfservice/secured/days_off/2021/listDaysOff')
      ) {
        if (this.responseType != 'blob' && this.responseText) {
          // responseText is string or null
          try {
            // console.log(this._url);
            console.log(JSON.parse(this.responseText));
            localStorage.setItem('days_off', this.responseText);
          } catch (err) {
            console.error('Error in reading response');
            console.warn(err);
          }
        }
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
