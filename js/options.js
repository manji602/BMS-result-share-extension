$(document).ready(function(){
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

    var LR2ID = chrome.extension.getBackgroundPage().getLR2ID();
    if (LR2ID) {
        $('#LR2ID').val(LR2ID);
    }

    $('button').click(function(){
        LR2ID = $('#LR2ID').val();
        chrome.extension.getBackgroundPage().setLR2ID(LR2ID);
    });
});

