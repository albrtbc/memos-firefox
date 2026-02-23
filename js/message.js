/**
 * Message notification component
 *
 * 1. Usage
 * String parameter: $.message('Success');
 * Object parameter: $.message({});
 *
 * 2. Parameters
 *  message: 'Operation successful',  // notification message
 *  time: '2000',                     // display duration (default: 2s)
 *  type: 'success',                  // display type, 4 options: success, error, info, warning
 *  showClose: false,                 // show close button (default: no)
 *  autoClose: true,                  // auto-close (default: yes)
 *
 * type: success, error, info, warning
 */

$.extend({
    message: function(options) {
        var defaults={
            message: 'Operation successful',
            time:'2000',
            autoClose: true,
            onClose:function(){}
        };

        if(typeof options === 'string'){
            defaults.message=options;
        }
        if(typeof options === 'object'){
            defaults=$.extend({},defaults,options);
        }
        // message template
        var template='<div class="tip animate bounceIn">\n' +
            '    <p class="tip-info">'+defaults.message+'</p>\n' +
            '</div>';
        var _this=this;
        var $body=$('body');
        var $message=$(template);
        var timer;

        // remove all existing messages and insert new one
        $('.tip').remove();
        $body.append($message);
        // center
        $message.css({
            'margin-left':'-'+$message.width()/2+'px'
        });


        // auto-close
        if (defaults.autoClose){
            timer=setTimeout(function(){
                closeFn();
            },defaults.time);
        }
        // close
        var closeFn = function(){
            $message.addClass('hide');
            $message.remove();
            defaults.onClose(defaults);
            clearTimeout(timer);
        };
    }
});
