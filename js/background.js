//CONSTANTS
var LATEST_RESULT_KEY_OF = {
    title      : '_LR2LatestSongTitle',
    status     : '_LR2LatestSongStatus',
    url        : '_LR2LatestSongUrl',
    difficulty : '_LR2LatestSongDifficulty',
    shareText  : '_LR2LatestSongShareText'
};
var DIFFICULTY_SYMBOL_OF = {
    Insane    : '★',
    LN        : '◆',
    Insane2nd : '▼',
    Scratch   : '◎'
};
var GET_RESULT_INTERVAL = 1000 * 120; // 2 minutes;
var INITIAL_LR2_ID      = 0;
var LR2IR_URL_TOPDIR    = 'http://www.dream-pro.info/~lavalse/LR2IR/';
var LR2IR_URL_HEADER    = LR2IR_URL_TOPDIR + 'search.cgi?mode=mypage&guestmode=1&playerid=';

//functions
var setLR2ID = function(LR2ID) {
    if ( !LR2ID || LR2ID.match( /[^0-9]+/ ) ){
        alert('入力が正しくありません');
    } else {
        alert(LR2ID + 'に設定しました。');
        localStorage['_LR2ID'] = LR2ID;
        backgroundPage.init();
    }
};

var getLR2ID = function() {
    var LR2ID = localStorage['_LR2ID'];
    return LR2ID;
};

var hasLR2ID = function() {
    var LR2ID = localStorage['_LR2ID'];
    if( LR2ID == INITIAL_LR2_ID || !LR2ID ) {
        return false;
    } else {
        return true;
    }
};

var hasResult = function() {
    var result = localStorage[LATEST_RESULT_KEY_OF.shareText];
    return result ? true : false;
};

var getResult = function() {
    var LR2ID = getLR2ID();

    if ( hasLR2ID ) {
        var LR2Url = LR2IR_URL_HEADER + LR2ID;
        getHTML(LR2Url, getLatestSongSummary);
    }
};

var getHTML = function(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', url, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    };
    xmlhttp.send(null);
};

var getLatestSongSummary = function(response) {
    if ( !response ) {
        return;
    }

    var parsedResponse = $.parseHTML(response);
    var latestSongHTML = $(parsedResponse).find('table:eq(3) tr:eq(1)');
    var detailUrl      = LR2IR_URL_TOPDIR + $(latestSongHTML).find('a').attr('href');

    localStorage[LATEST_RESULT_KEY_OF.title ] = $(latestSongHTML).find('a').html();
    localStorage[LATEST_RESULT_KEY_OF.status] = $(latestSongHTML).find('td:eq(2)').html();
    localStorage[LATEST_RESULT_KEY_OF.url   ] = detailUrl;

    getHTML(detailUrl, getLatestSongDetail);
};

var getLatestSongDetail = function(response) {
    if ( !response ) {
        return;
    }

    localStorage[LATEST_RESULT_KEY_OF.difficulty] = getDifficulty(response);

    var shareText =
        localStorage[LATEST_RESULT_KEY_OF.difficulty] + ' ' +
        localStorage[LATEST_RESULT_KEY_OF.title] + ' ' +
        localStorage[LATEST_RESULT_KEY_OF.status];

    localStorage[LATEST_RESULT_KEY_OF.shareText] = escapeCharacters(shareText);
};

var getDifficulty = function(response) {
    var difficulty = getLevelDifficulty(response);
    difficulty += getTagDifficulty(response);

    return difficulty;
};

var getDifficultyCategory = function() {
    var difficultySymbols = [
        DIFFICULTY_SYMBOL_OF.Insane,
        DIFFICULTY_SYMBOL_OF.LN,
        DIFFICULTY_SYMBOL_OF.Insane2nd,
        DIFFICULTY_SYMBOL_OF.Scratch,
    ];
    return new RegExp(difficultySymbols.join('|'));
};

var getLevelDifficulty = function(response) {
    var parsedResponse = $.parseHTML(response);
    var levelHTML      = $(parsedResponse).find('table:eq(0) td:eq(1)');
    var levelLinks     = $(levelHTML).find('a');
    var category       = getDifficultyCategory();
    var difficulty     = '';

    levelLinks.each(function(){
        var tagLink = $(this).html();
        if (tagLink.match(category)) {
            difficulty += '【' + tagLink + '】';
        }
    });

    return difficulty;
};

var getTagDifficulty = function(response) {
    var parsedResponse = $.parseHTML(response);
    var tagHTML        = $(parsedResponse).find('table:eq(0) td:eq(4)');
    var tagLinks       = $(tagHTML).find('a');
    var category       = getDifficultyCategory();
    var difficulty     = '';

    tagLinks.each(function(){
        var tagLink = $(this).html();
        if (tagLink.match(category)) {
            difficulty += '【' + tagLink + '】';
        }
    });

    return difficulty;
};

var convertToTwoByteCharacter = function(string) {
    var convertedString = string.replace(/[A-Za-z0-9]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });

    return convertedString;
};

var escapeCharacters = function(string) {
    return string.replace(/["]/g, '&quot;' );
};
