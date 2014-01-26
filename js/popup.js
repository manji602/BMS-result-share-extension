//function of twitter widget
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

$('body').ready(function(){
    $('#reloadButton').click(function(){
        if ( chrome.extension.getBackgroundPage().hasLR2ID() ) {
            reloadResult();
        } else {
            showError();
        }
    });

    setResultLoop();
});

//CONSTANTS
var SET_TIME_OUT_MSEC_LOOP   = 20000;
var SET_TIME_OUT_MSEC_RELOAD = 1000;

//functions
var reloadResult = function() {
    $('#main').show();

    var deferred = $.Deferred();
    deferred.then(function() {
        showLoading();
    }).then(function() {
        return getResult();
    })
    .then(function() {
        return setResult(SET_TIME_OUT_MSEC_RELOAD);
    })
    .then(function() {
        hideLoading();
    });

    deferred.resolve();
};

var showLoading = function() {
    $('#result').html('now loading...');
    $('#reloadButton').hide();
    $('#loadingAnimation').show();
};

var hideLoading = function() {
    $('#reloadButton').show();
    $('#loadingAnimation').hide();
};

var asyncFunction = function(callback) {
    var d = $.Deferred();
    setTimeout(function() {
        callback();
        d.resolve();
    }, 1000);

    return d;
};

var getResult = function() {
    var d = $.Deferred();

    setTimeout(function() {
        chrome.extension.getBackgroundPage().getResult();
        d.resolve();
    }, 1000);

    return d;
};

var setResult = function(msec) {
    var d = $.Deferred();

    setTimeout(function() {
        var latestSongTitle  = '';
        var localStorageKey  = chrome.extension.getBackgroundPage().LATEST_RESULT_KEY_OF.shareText;
        latestSongTitle      = localStorage[localStorageKey];

        var twitterShareHTML = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="" data-text="' +
                               latestSongTitle +
                               '" data-via="" data-lang="ja" data-count="none" data-hashtags="iidx">ツイート</a>';

        if (latestSongTitle) {
            $('#result').html(latestSongTitle);
            $('#tweet-button').html(twitterShareHTML);
        } else {
            $('#result').html('リザルトを取得できませんでした。もう一度更新するか、idの設定が誤っていないか確認してください。');
            $('#tweet-button').html();
        }

        try {
            twttr.widgets.load();
        } catch( error ) {
            console.log(error);
        }

        d.resolve();
    }, msec);

    return d;
};

var showError = function() {
    $('#main').hide();
    $('#error').html('<div class="alert alert-warning fade in"><a href="options.html" target="_blank">オプションページ</a>からLR2IDを設定してください。</div>');
};

var setResultLoop = function() {
    var background = chrome.extension.getBackgroundPage();
    if ( background.hasLR2ID() ) {
        if ( background.hasResult() ) {
            setResult();
        }
    } else {
        showError();
    }

    setTimeout('setResultLoop()', SET_TIME_OUT_MSEC_LOOP);
};
