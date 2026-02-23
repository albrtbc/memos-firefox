dayjs.extend(window.dayjs_plugin_relativeTime)
dayjs.locale('en')

function get_info(callback) {
  chrome.storage.sync.get(
    {
      apiUrl: '',
      apiTokens: '',
      hidetag: '',
      showtag: '',
      memo_lock: '',
      open_action: '',
      open_content: '',
      userid: '',
      attachmentList: []
    },
    function (items) {
      var flag = false
      var returnObject = {}
      if (items.apiUrl === '' || items.repo === '') {
        flag = false
      } else {
        flag = true
      }
      returnObject.status = flag
      returnObject.apiUrl = items.apiUrl
      returnObject.apiTokens = items.apiTokens
      returnObject.hidetag = items.hidetag
      returnObject.showtag = items.showtag
      returnObject.memo_lock = items.memo_lock
      returnObject.open_content = items.open_content
      returnObject.open_action = items.open_action
      returnObject.userid = items.userid
      returnObject.attachmentList = items.attachmentList

      if (callback) callback(returnObject)
    }
  )
}

get_info(function (info) {
  if (info.status) {
    // settings already saved, collapse
    $('#blog_info').hide()
  }
  var memoNow = info.memo_lock
  if (memoNow == '') {
    chrome.storage.sync.set(
      { memo_lock: 'PUBLIC' }
    )
    $("#lock-now").text(chrome.i18n.getMessage("lockPublic"))
  }
  if (memoNow == "PUBLIC") {
    $("#lock-now").text(chrome.i18n.getMessage("lockPublic"))
  } else if (memoNow == "PRIVATE") {
    $("#lock-now").text(chrome.i18n.getMessage("lockPrivate"))
  } else if (memoNow == "PROTECTED") {
    $("#lock-now").text(chrome.i18n.getMessage("lockProtected"))
  }
  $('#apiUrl').val(info.apiUrl)
  $('#apiTokens').val(info.apiTokens)
  $('#hideInput').val(info.hidetag)
  $('#showInput').val(info.showtag)
  if (info.open_action === 'upload_image') {
    // opened with an image upload action
    uploadImage(info.open_content)
  } else {
    $("textarea[name=text]").val(info.open_content)
  }
  // read data from local storage
  setTimeout(get_info, 1)
})

$("textarea[name=text]").focus()

// auto-save all fields on input so nothing is lost when popup closes
$("textarea[name=text]").on('input', function () {
  chrome.storage.sync.set(
    { open_action: 'save_text', open_content: $("textarea[name=text]").val() }
  )
})
$('#apiUrl').on('input', function () {
  chrome.storage.sync.set({ apiUrl: $(this).val() })
})
$('#apiTokens').on('input', function () {
  chrome.storage.sync.set({ apiTokens: $(this).val() })
})

$("textarea[name=text]").on('keydown', function (ev) {
  if (ev.code === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
    $('#content_submit_text').click()
  }
})

// listen for drag events to enable drag-and-drop image upload
initDrag()

// listen for paste events to enable paste-to-upload image
document.addEventListener('paste', function (e) {
  let photo = null
  if (e.clipboardData.files[0]) {
    photo = e.clipboardData.files[0]
  } else if (e.clipboardData.items[0] && e.clipboardData.items[0].getAsFile()) {
    photo = e.clipboardData.items[0].getAsFile()
  }

  if (photo != null) {
    uploadImage(photo)
  }
})

function initDrag() {
  var file = null
  var obj = $("textarea[name=text]")[0]
  obj.ondragenter = function (ev) {
    if (ev.target.className === 'common-editor-inputer') {
      $.message({
        message: chrome.i18n.getMessage("picDrag"),
        autoClose: false
      })
      $('body').css('opacity', 0.3)
    }
    ev.dataTransfer.dropEffect = 'copy'
  }
  obj.ondragover = function (ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }
  obj.ondrop = function (ev) {
    $('body').css('opacity', 1)
    ev.preventDefault()
    var files = ev.dataTransfer.files || ev.target.files
    for (var i = 0; i < files.length; i++) {
      file = files[i]
    }
    uploadImage(file)
  }
  obj.ondragleave = function (ev) {
    ev.preventDefault()
    if (ev.target.className === 'common-editor-inputer') {
      $.message({
        message: chrome.i18n.getMessage("picCancelDrag")
      })
      $('body').css('opacity', 1)
    }
  }
}

let relistNow = []
function uploadImage(file) {
  $.message({
    message: chrome.i18n.getMessage("picUploading"),
    autoClose: false
  });
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64String = e.target.result.split(',')[1];
      uploadImageNow(base64String, file);
    };
    reader.onerror = function(error) {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(file);
};

function uploadImageNow(base64String, file) {
  get_info(function(info) {
    if (info.status) {
      let old_name = file.name.split('.');
      let file_ext = file.name.split('.').pop();
      let now = dayjs().format('YYYYMMDDHHmmss');
      let new_name = old_name[0] + '_' + now + '.' + file_ext;
      var hideTag = info.hidetag
      var showTag = info.showtag
      var nowTag = $("textarea[name=text]").val().match(/(#[^\s#]+)/)
      var sendvisi = info.memo_lock || ''
      if(nowTag){
        if(nowTag[1] == showTag){
          sendvisi = 'PUBLIC'
        }else if(nowTag[1] == hideTag){
          sendvisi = 'PRIVATE'
        }
      }
      const data = {
        content: base64String,
        filename: new_name,
        type: file.type
      };
      var upAjaxUrl = info.apiUrl + 'api/v1/attachments';
      $.ajax({
        url: upAjaxUrl,
        data: JSON.stringify(data),
        type: 'post',
        cache: false,
        processData: false,
        contentType: 'application/json',
        dataType: 'json',
        headers: { 'Authorization': 'Bearer ' + info.apiTokens },
        success: function (data) {
          if (data.name) {
            relistNow.push({
              "name": data.name
            })
            chrome.storage.sync.set(
              {
                open_action: '',
                open_content: '',
                attachmentList: relistNow
              },
              function () {
                $.message({
                  message: chrome.i18n.getMessage("picSuccess")
                })
              }
            )
          } else {
            // upload failed, clear open_action and open_content
            chrome.storage.sync.set(
              {
                open_action: '',
                open_content: '',
                attachmentList: []
              },
              function () {
                $.message({
                  message: chrome.i18n.getMessage("picFailed")
                })
              }
            )
          }
        }
      });
    }else {
      $.message({
        message: chrome.i18n.getMessage("placeApiUrl")
      })
    }
  });
}

$('#saveKey').click(function () {
  var apiUrl = $('#apiUrl').val()
  if (apiUrl.length > 0 && !apiUrl.endsWith('/')) {
    apiUrl += '/';
  }
  var apiTokens = $('#apiTokens').val()
  // set request parameters
  const settings = {
    async: true,
    crossDomain: true,
    url: apiUrl + 'api/v1/auth/me',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + apiTokens
    }
  };

  $.ajax(settings).done(function (response) {
    if (response && response.user && response.user.name) {
      // if response contains user name, store apiUrl and apiTokens
      var userId = response.user.name.split('/')[1];
      chrome.storage.sync.set(
        {
          apiUrl: apiUrl,
          apiTokens: apiTokens,
          userid: userId
        },
        function () {
          $.message({
            message: chrome.i18n.getMessage("saveSuccess")
          });
          $('#blog_info').hide();
        }
      );
    } else {
      // if response does not contain user ID, show error message
      $.message({
        message: chrome.i18n.getMessage("invalidToken")
      });
    }
  }).fail(function () {
    // show error message on request failure
    $.message({
      message: chrome.i18n.getMessage("invalidToken")
    });
  });
});

$('#opensite').click(function () {
  get_info(function (info) {
    chrome.tabs.create({url:info.apiUrl})
  })
})

$('#tags').click(function () {
  get_info(function (info) {
    if (info.apiUrl) {
      var tagUrl = info.apiUrl + 'api/v1/users/' + info.userid + ':getStats';
      var tagDom = "";
      $.ajax({
        url: tagUrl,
        type: "GET",
        contentType: "application/json;",
        dataType: "json",
        headers: { 'Authorization': 'Bearer ' + info.apiTokens },
        success: function (data) {
          $.each(data.tagCount, function (tag, count) {
            tagDom += '<span class="item-container">#' + tag + '</span>';
          });
          tagDom += '<svg id="hideTag" class="hidetag" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M78.807 362.435c201.539 314.275 666.962 314.188 868.398-.241 16.056-24.99 13.143-54.241-4.04-62.54-17.244-8.377-40.504 3.854-54.077 24.887-174.484 272.338-577.633 272.41-752.19.195-13.573-21.043-36.874-33.213-54.113-24.837-17.177 8.294-20.06 37.545-3.978 62.536z" fill="#fff"/><path d="M894.72 612.67L787.978 494.386l38.554-34.785 106.742 118.251-38.554 34.816zM635.505 727.51l-49.04-147.123 49.255-16.41 49.054 147.098-49.27 16.435zm-236.18-12.001l-49.568-15.488 43.29-138.48 49.557 15.513-43.28 138.455zM154.49 601.006l-38.743-34.565 95.186-106.732 38.763 34.566-95.206 106.731z" fill="#fff"/></svg>'
          $("#taglist").html(tagDom).slideToggle(500)
        }
      })
    } else {
      $.message({
        message: chrome.i18n.getMessage("placeApiUrl")
      })
    }
  })
})

$(document).on("click","#hideTag",function () {
  $('#taghide').slideToggle(500)
})

$('#saveTag').click(function () {
  // save data
  chrome.storage.sync.set(
    {
      hidetag: $('#hideInput').val(),
      showtag: $('#showInput').val()
    },
    function () {
      $.message({
        message: chrome.i18n.getMessage("saveSuccess")
      })
      $('#taghide').hide()
    }
  )
})

$('#lock').click(function () {
  $("#lock-wrapper").toggleClass( "!hidden", 1000 );
})

$(document).on("click",".item-lock",function () {
  $("#lock-wrapper").toggleClass( "!hidden", 1000 );
  $("#lock-now").text($(this).text())
    _this = $(this)[0].dataset.type;
    chrome.storage.sync.set(
      {memo_lock: _this}
    )
})

$('#search').click(function () {
  get_info(function (info) {
  const pattern = $("textarea[name=text]").val()
  var filter = "?filter=" + encodeURIComponent(`creator == 'users/${info.userid}' && visibilities == ['PUBLIC', 'PROTECTED'] && content_search == ['${pattern}']`);
  if (info.status) {
    $("#randomlist").html('').hide()
    var searchDom = ""
    if(pattern){
      $.ajax({
        url:info.apiUrl+"api/v1/memos"+filter,
        type:"GET",
        contentType:"application/json;",
        dataType:"json",
        headers : {'Authorization':'Bearer ' + info.apiTokens},
        success: function(data){
          let searchData = data.memos
          if(searchData.length == 0){
            $.message({
              message: chrome.i18n.getMessage("searchNone")
            })
          }else{
            for(var i=0;i < searchData.length;i++){
              var memoUid = searchData[i].name.split('/')[1];
              searchDom += '<div class="random-item"><div class="random-time"><span id="random-link" data-uid="'+memoUid+'"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M864 640a32 32 0 0 1 64 0v224.096A63.936 63.936 0 0 1 864.096 928H159.904A63.936 63.936 0 0 1 96 864.096V159.904C96 124.608 124.64 96 159.904 96H384a32 32 0 0 1 0 64H192.064A31.904 31.904 0 0 0 160 192.064v639.872A31.904 31.904 0 0 0 192.064 864h639.872A31.904 31.904 0 0 0 864 831.936V640zm-485.184 52.48a31.84 31.84 0 0 1-45.12-.128 31.808 31.808 0 0 1-.128-45.12L815.04 166.048l-176.128.736a31.392 31.392 0 0 1-31.584-31.744 32.32 32.32 0 0 1 31.84-32l255.232-1.056a31.36 31.36 0 0 1 31.584 31.584L924.928 388.8a32.32 32.32 0 0 1-32 31.84 31.392 31.392 0 0 1-31.712-31.584l.736-179.392L378.816 692.48z" fill="#666" data-spm-anchor-id="a313x.7781069.0.i12" class="selected"/></svg></span><span id="random-delete" data-name="'+searchData[i].name+'" data-uid="'+memoUid+'"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M224 322.6h576c16.6 0 30-13.4 30-30s-13.4-30-30-30H224c-16.6 0-30 13.4-30 30 0 16.5 13.5 30 30 30zm66.1-144.2h443.8c16.6 0 30-13.4 30-30s-13.4-30-30-30H290.1c-16.6 0-30 13.4-30 30s13.4 30 30 30zm339.5 435.5H394.4c-16.6 0-30 13.4-30 30s13.4 30 30 30h235.2c16.6 0 30-13.4 30-30s-13.4-30-30-30z" fill="#666"/><path d="M850.3 403.9H173.7c-33 0-60 27-60 60v360c0 33 27 60 60 60h676.6c33 0 60-27 60-60v-360c0-33-27-60-60-60zm-.1 419.8l-.1.1H173.9l-.1-.1V464l.1-.1h676.2l.1.1v359.7z" fill="#666"/></svg></span>'+dayjs(searchData[i].displayTime || searchData[i].createTime).fromNow()+'</div><div class="random-content">'+searchData[i].content.replace(/!\[.*?\]\((.*?)\)/g,' <img class="random-image" src="$1"/> ').replace(/\[(.*?)\]\((.*?)\)/g,' <a href="$2" target="_blank">$1</a> ')+'</div>'
              if(searchData[i].attachments && searchData[i].attachments.length > 0){
                var attachments = searchData[i].attachments;
                for(var j=0;j < attachments.length;j++){
                  var restype = attachments[j].type.slice(0,5);
                  var resexlink = attachments[j].externalLink
                  var resLink = ''
                  if(resexlink){
                    resLink = resexlink
                  }else{
                    resLink = info.apiUrl+'file/'+attachments[j].name+'/'+attachments[j].filename
                }
                  if(restype == 'image'){
                    searchDom += '<img class="random-image" src="'+resLink+'"/>'
                  }
                  if(restype !== 'image'){
                    searchDom += '<a target="_blank" rel="noreferrer" href="'+resLink+'">'+attachments[j].filename+'</a>'
                  }
                }
              }
              searchDom += '</div>'
            }
            window.ViewImage && ViewImage.init('.random-image')
            $("#randomlist").html(searchDom).slideDown(500);
          }
        }
      });
    }else{
      $.message({
        message: chrome.i18n.getMessage("searchNow")
      })
    }
  } else {
    $.message({
      message: chrome.i18n.getMessage("placeApiUrl")
    })
  }
})
})

$('#random').click(function () {
  get_info(function (info) {
    var filter = "?filter=" + encodeURIComponent(`creator == 'users/${info.userid}'`);
    if (info.status) {
      $("#randomlist").html('').hide()
      var randomUrl = info.apiUrl + 'api/v1/memos' + filter;
      $.ajax({
        url:randomUrl,
        type:"GET",
        contentType:"application/json;",
        dataType:"json",
        headers : {'Authorization':'Bearer ' + info.apiTokens},
        success: function(data){
          let randomNum = Math.floor(Math.random() * (data.memos.length));
          var randomData = data.memos[randomNum]
          randDom(randomData)
        }
      })
    } else {
      $.message({
        message: chrome.i18n.getMessage("placeApiUrl")
      })
    }
  })
})

function randDom(randomData){
  get_info(function (info) {
  var memoUid = randomData.name.split('/')[1];
  var randomDom = '<div class="random-item"><div class="random-time"><span id="random-link" data-uid="'+memoUid+'"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M864 640a32 32 0 0 1 64 0v224.096A63.936 63.936 0 0 1 864.096 928H159.904A63.936 63.936 0 0 1 96 864.096V159.904C96 124.608 124.64 96 159.904 96H384a32 32 0 0 1 0 64H192.064A31.904 31.904 0 0 0 160 192.064v639.872A31.904 31.904 0 0 0 192.064 864h639.872A31.904 31.904 0 0 0 864 831.936V640zm-485.184 52.48a31.84 31.84 0 0 1-45.12-.128 31.808 31.808 0 0 1-.128-45.12L815.04 166.048l-176.128.736a31.392 31.392 0 0 1-31.584-31.744 32.32 32.32 0 0 1 31.84-32l255.232-1.056a31.36 31.36 0 0 1 31.584 31.584L924.928 388.8a32.32 32.32 0 0 1-32 31.84 31.392 31.392 0 0 1-31.712-31.584l.736-179.392L378.816 692.48z" fill="#666" data-spm-anchor-id="a313x.7781069.0.i12" class="selected"/></svg></span><span id="random-delete" data-uid="'+memoUid+'" data-name="'+randomData.name+'"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M224 322.6h576c16.6 0 30-13.4 30-30s-13.4-30-30-30H224c-16.6 0-30 13.4-30 30 0 16.5 13.5 30 30 30zm66.1-144.2h443.8c16.6 0 30-13.4 30-30s-13.4-30-30-30H290.1c-16.6 0-30 13.4-30 30s13.4 30 30 30zm339.5 435.5H394.4c-16.6 0-30 13.4-30 30s13.4 30 30 30h235.2c16.6 0 30-13.4 30-30s-13.4-30-30-30z" fill="#666"/><path d="M850.3 403.9H173.7c-33 0-60 27-60 60v360c0 33 27 60 60 60h676.6c33 0 60-27 60-60v-360c0-33-27-60-60-60zm-.1 419.8l-.1.1H173.9l-.1-.1V464l.1-.1h676.2l.1.1v359.7z" fill="#666"/></svg></span>'+dayjs(randomData.displayTime || randomData.createTime).fromNow()+'</div><div class="random-content">'+randomData.content.replace(/!\[.*?\]\((.*?)\)/g,' <img class="random-image" src="$1"/> ').replace(/\[(.*?)\]\((.*?)\)/g,' <a href="$2" target="_blank">$1</a> ')+'</div>'
  if(randomData.attachments && randomData.attachments.length > 0){
    var attachments = randomData.attachments;
    for(var j=0;j < attachments.length;j++){
      var restype = attachments[j].type.slice(0,5);
      var resexlink = attachments[j].externalLink
      var resLink = ''
      if(resexlink){
        resLink = resexlink
      }else{
        resLink = info.apiUrl+'file/'+attachments[j].name+'/'+attachments[j].filename
      }
      if(restype == 'image'){
        randomDom += '<img class="random-image" src="'+resLink+'"/>'
      }
      if(restype !== 'image'){
        randomDom += '<a target="_blank" rel="noreferrer" href="'+resLink+'">'+attachments[j].filename+'</a>'
      }
    }
  }
  randomDom += '</div>'
  window.ViewImage && ViewImage.init('.random-image')
  $("#randomlist").html(randomDom).slideDown(500);
  })
}

$(document).on("click","#random-link",function () {
  var memoUid = $("#random-link").data('uid');
  get_info(function (info) {
    chrome.tabs.create({url:info.apiUrl+"memos/"+memoUid})
  })
})

$(document).on("click","#random-delete",function () {
get_info(function (info) {
  var memosName = $("#random-delete").data('name');
  var deleteUrl = info.apiUrl+'api/v1/'+memosName
  $.ajax({
    url:deleteUrl,
    type:"PATCH",
    data:JSON.stringify({
      'name': memosName,
      'state': "ARCHIVED"
    }),
    contentType:"application/json;",
    dataType:"json",
    headers : {'Authorization':'Bearer ' + info.apiTokens},
    success: function(result){
          $("#randomlist").html('').hide()
              $.message({
                message: chrome.i18n.getMessage("archiveSuccess")
              })
  },error:function(err){ // archive failed
              $.message({
                message: chrome.i18n.getMessage("archiveFailed")
              })
          }
  })
})
})

$(document).on("click",".item-container",function () {
  var tagHtml = $(this).text()+" "
  add(tagHtml);
})

$('#newtodo').click(function () {
  var tagHtml = "\n- [ ] "
  add(tagHtml);
})

$('#getlink').click(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    var linkHtml = " ["+tab.title+"]("+tab.url+") "
    if(tab.url){
      add(linkHtml);
    }else{
      $.message({
        message: chrome.i18n.getMessage("getTabFailed")
      })
    }
  })
})

$('#upres').click(async function () {
  $('#inFile').click()
})

$('#inFile').on('change', function(data){
  var fileVal = $('#inFile').val();
  var file = null
  if(fileVal == '') {
    return;
  }
  file= this.files[0];
  uploadImage(file)
});

function add(str) {
  var tc = document.getElementById("content");
  var tclen = tc.value.length;
  tc.focus();
  if(typeof document.selection != "undefined"){
    document.selection.createRange().text = str;
  }else{
    tc.value = 
      tc.value.substr(0, tc.selectionStart) +
      str +
      tc.value.substring(tc.selectionStart, tclen);
  }
}

$('#blog_info_edit').click(function () {
  $('#blog_info').slideToggle()
})

$('#content_submit_text').click(function () {
  var contentVal = $("textarea[name=text]").val()
  if(contentVal){
    sendText()
  }else{
    $.message({
      message: chrome.i18n.getMessage("placeContent")
    })
  }
})

function getOne(memosId){
  get_info(function (info) {
  if (info.apiUrl) {
    $("#randomlist").html('').hide()
        var getUrl = info.apiUrl+'api/v1/'+memosId
        $.ajax({
          url:getUrl,
          type:"GET",
          contentType:"application/json;",
          dataType:"json",
          headers : {'Authorization':'Bearer ' + info.apiTokens},
          success: function(data){
            randDom(data)
          }
        })
  } else {
    $.message({
      message: chrome.i18n.getMessage("placeApiUrl")
    })
  }
  })
}

function sendText() {
  get_info(function (info) {
    if (info.status) {
      $.message({
        message: chrome.i18n.getMessage("memoUploading")
      })
      // $("#content_submit_text").attr('disabled','disabled');
      let content = $("textarea[name=text]").val()
      var hideTag = info.hidetag
      var showTag = info.showtag
      var nowTag = $("textarea[name=text]").val().match(/(#[^\s#]+)/)
      var sendvisi = info.memo_lock || ''
      if(nowTag){
        if(nowTag[1] == showTag){
          sendvisi = 'PUBLIC'
        }else if(nowTag[1] == hideTag){
          sendvisi = 'PRIVATE'
        }
      }
      $.ajax({
        url:info.apiUrl+'api/v1/memos',
        type:"POST",
        data:JSON.stringify({
          'content': content,
          'visibility': sendvisi
        }),
        contentType:"application/json;",
        dataType:"json",
        headers : {'Authorization':'Bearer ' + info.apiTokens},
        success: function(data){
          if(info.attachmentList.length > 0 ){
            // attach uploaded attachments
            $.ajax({
              url:info.apiUrl+'api/v1/'+data.name+'/attachments',
              type:"PATCH",
              data:JSON.stringify({
                'name': data.name,
                'attachments': info.attachmentList || [],
              }),
              contentType:"application/json;",
              dataType:"json",
              headers : {'Authorization':'Bearer ' + info.apiTokens},
              success: function(res){
                getOne(data.name)
              }
            })
          }else{
            getOne(data.name)
          }
          chrome.storage.sync.set(
            { open_action: '', open_content: '',attachmentList:''},
            function () {
              $.message({
                message: chrome.i18n.getMessage("memoSuccess")
              })
              // $("#content_submit_text").removeAttr('disabled');
              $("textarea[name=text]").val('')
            }
          )
      },error:function(err){ // clear open_action and open_content on failure
              chrome.storage.sync.set(
                { open_action: '', open_content: '',attachmentList:'' },
                function () {
                  $.message({
                    message: chrome.i18n.getMessage("memoFailed")
                  })
                }
              )},
      })
    } else {
      $.message({
        message: chrome.i18n.getMessage("placeApiUrl")
      })
    }
  })
}  