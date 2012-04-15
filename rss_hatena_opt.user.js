// ==UserScript==
// @name        rss hatena option
// @namespace   http://ryoff.com
// @description add rss button, hatena bookmark option
// @include     http://*
// @version     0.0.1
// ==/UserScript==

if (!window.parent) {//子フレームには表示しない
    return;
}

var VERSION = '0.0.1';
var DEBUG = false;
var HTBCOUNTID = 'htbCount';
var HTBOPTID1 = 'hot';
var HTBOPTID2 = 'count';
var URL = 'http://b.hatena.ne.jp/entrylist?sort=$SORT&threshold=$THRESHOLD&url=$URL&mode=rss';

//rssボタン表示するドメインと記事URLが違う場合
var SITEINFO = [
    /* sample
    {
        rssViewUrl:     'http://ryoff.com/.*',     //ここは正規表現で
        entryDomainUrl: 'http://e.ryoff.com/',
    },
    */
    {
        rssViewUrl:     'http://nanapi.jp/.*',     //ここは正規表現で
        entryDomainUrl: 'http://r.nanapi.jp/',
    },
    {
        rssViewUrl:     'http://d.hatena.ne.jp/([^/]+)/.*',     //ここは正規表現で
        entryDomainUrl: 'http://d.hatena.ne.jp/$1/',
    },
    {
        rssViewUrl:     'http://blog.livedoor.jp/([^/]+)/.*',     //ここは正規表現で
        entryDomainUrl: 'http://blog.livedoor.jp/$1/',
    },
];
//デフォルト
var MICROFORMAT = {
    rssViewUrl:     '.*',
    entryDomainUrl: 'http://'+window.location.host,
}

var RssOpt = function(info) {
    this.info = info;
    this.url = URL;
    this.initImg();
}

RssOpt.prototype.initImg = function() {
    var rssBtnArea = document.createElement("span");
    rssBtnArea.setAttribute("id", "rssBtnAreaId");
    rssBtnArea.setAttribute('style', 'background:#f60;z-index:255;position:fixed;'
                            + 'top:2px;left:2px;font-size:12px;width:10px;height:10px;');
    
    var rssCloseSpan = document.createElement("span");
    rssCloseSpan.setAttribute("id", "rssOptCloseId");
    rssCloseSpan.setAttribute('style', 'background:#fff;color:#555;font-weight:bold;width:10px;height:10px;'
                            + 'z-index:255;position:fixed;top:2px;left:12px;font-size:10px;'
                            + 'vertical-align:middle;white-space:nowrap;text-align:center;'
                            + 'background-repeat:no-repeat;line-height:10px;');
    rssCloseSpan.innerHTML = "×";
    rssCloseSpan.addEventListener("click", function() {
        rssBtnArea.setAttribute('style', 'display:none;');
        rssCloseSpan.setAttribute('style', 'display:none;');
    }, false);
    
    var rssOptArea = document.createElement("div");
    rssOptArea.setAttribute("id", "rssOptAreaId");
    rssOptArea.setAttribute('style', 'background:#fff;z-index:256;position:fixed;'
                            + 'top:-200px;left:2px;font-size:12px;width:120px;height:40px;border:1px solid #ccc;');
    
    var radioArea = '<div style="font-size:10px;white-space:nowrap;height:20px;text-align:center;">'
                + '<input type="radio" value="hot" id="' + HTBOPTID1 + '" name="opt" checked><label for="hot">新着順</label>'
                + '<input type="radio" value="count" id="' + HTBOPTID2 + '" name="opt"><label for="count">人気順</label></div>';
    var textArea = '<span style="font-size:10px;white-space:nowrap;">'
                + '<input type="text" size="5" maxlength="4" value="10" id="' + HTBCOUNTID + '" '
                + 'style="font-size:9px;background-color:#ccc;border: #ccc 1pt double;">はてブ以上</span>';
    var textBtnArea = document.createElement("div");
    textBtnArea.setAttribute("style", 'font-size:10px;white-space:nowrap;height:20px;text-align:center;');
    textBtnArea.innerHTML = textArea;
    var rssBtn = document.createElement("span");
    rssBtn.setAttribute("id", "rssBtnId");
    rssBtn.setAttribute("style", 'background:#f60;color:#fff;font-weight:bold;vertical-align:middle;font-size:10px;cursor:pointer;'
                                + 'width:30px;white-space:nowrap;text-align:center;');
    var rssA = document.createElement("a");
    rssA.setAttribute("id", "rssAId");
    rssA.setAttribute("href", "javascript:void(0);");
    rssA.innerHTML = "RSS";
    var self = this;
    rssA.addEventListener("click", function() {
        self.addRss();
    }, false);
    rssBtn.appendChild(rssA);
    
    rssOptArea.innerHTML = radioArea;
    textBtnArea.appendChild(rssBtn);
    rssOptArea.appendChild(textBtnArea);
    
    var optHidden = function(e) {
        var c_style = document.defaultView.getComputedStyle(rssOptArea, '')
        var s = ['top', 'left', 'height', 'width'].map(function(i) {
            return parseInt(c_style.getPropertyValue(i));
        })
        if (e.clientX < s[1] || e.clientX > (s[1] + s[3]) ||
            e.clientY < s[0] || e.clientY > (s[0] + s[2])) {
            rssOptArea.style.top = '-200px';
        }
    }
    
    rssOptArea.addEventListener("mouseout", optHidden, false);
    rssBtnArea.addEventListener("mouseover", function() {rssOptArea.style.top = '2px';}, false);
    
    document.body.appendChild(rssBtnArea);
    document.body.appendChild(rssCloseSpan);
    document.body.appendChild(rssOptArea);
}

RssOpt.prototype.addRss = function() {
    var hateb_count = document.getElementById(HTBCOUNTID).value;
    var hateb_opt   = (document.getElementById(HTBOPTID1).checked) ? document.getElementById(HTBOPTID1).value : document.getElementById(HTBOPTID2).value;
    this.url = this.url.replace("\$SORT", hateb_count);
    this.url = this.url.replace("\$THRESHOLD", hateb_opt);
    this.url = this.url.replace("\$URL", escape(this.info.entryDomainUrl));
    debug("open url : ", this.url);
    window.open(this.url);
    this.addRssEnd();
}

RssOpt.prototype.addRssEnd = function() {
    this.url = URL;
    debug("END open url : ", this.url);
    return;
}

var launchRssOpt = function(l) {
    if (l.length == 0 || rss) {
        return;
    }
    else {
        for (var i = 0; i < l.length; i++) {
            try {
                if (location.href.match(l[i].rssViewUrl)) {
                    debug("match : ", RegExp.length);
                    if (RegExp.length > 0) {
                        for (var j = 1; j <= RegExp.length; j++) {
                            l[i].entryDomainUrl = l[i].entryDomainUrl.replace("\$"+j, eval("RegExp.$"+j));
                        }
                    }
                    debug("entryDomainUrl : ", l[i].entryDomainUrl);
                    rss = new RssOpt(l[i]);
                    return;
                }
            }
            catch(e) {
                log(e);
                return;
            }
        }
    }
}

var rss = null;
launchRssOpt(SITEINFO);
launchRssOpt([MICROFORMAT]);

function debug() {
    if ( typeof DEBUG != 'undefined' && DEBUG ) {
        console.log.apply(this, arguments)
    }
}

function log(message) {
    if (typeof console == 'object') {
        console.log(message)
    }
    else {
        GM_log(message)
    }
}

