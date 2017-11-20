var $code, $name, $group, $picture, $teamList;
var $token = { access_token: ''};

var apiUrl = 'http://localhost:3000/api/';
//var urlToChangeStream = apiUrl + 'Teams/change-stream?_format=event-stream';
//var src = new EventSource(urlToChangeStream);

$(document).ready(function() {

    $('#addTeamForm').on('submit', handleForm);

    $code = $('#code');
    $name = $('#name');
    $group = $('#group');
    $picture = $('#picture');
    
    $teamList = $('#teamList');

    loginServer('admin@csc.com', 'admin');

});

function loginServer(email, pass){
    $.ajax({
        method: "POST",
        url: apiUrl + 'accounts/login',
        data: { 'email':email, 'password':pass }
    })
    .done(function( res ) {
        console.log(res);
        if(res.success){
            $token.access_token = res.data.id;

            $.ajaxSetup({
                headers: { "Authorization": $token.access_token }
            });

            console.log($token);

            // src.addEventListener('data', function(msg) {
            //     var data = JSON.parse(msg.data);
            //     console.log('Change data:');
            //     console.log(data); // the change object
            // });
            
            getTeams();

            
        }
    })
    .fail(function( error ) {
        console.error(error);
    });
}

function getTeams() {
    var list = '';

    $.ajax({
        method: "GET",
        url: apiUrl + 'teams'
    })
    .done(function( res ) {
        res.data.forEach(function(team) {
            console.log(team);
            list += `<h2>${team.teamCode}</h2>`;
            if(team.picture) {
                list += `<img src='${team.picture}'>`;
            }
            list += `
            <p>
            ${team.teamCode} is a ${team.teamName} of group ${team.group}.
            </p>`;
        });
        $teamList.html(list);
    })
    .fail(function( error ) {
        console.error(error);
    });
}

function handleForm(e) {
    e.preventDefault();

    var team = {
        teamCode: $code.val(),
        teamName: $name.val(),
        group: $group.val()
    }

    // step 1 - make the cat, this gives us something to associate with
    $.ajax({
        method: "POST",
        url: apiUrl + 'teams',
        data: team
    })
    .done(function( res ) {
        //copy res since it has the id
        team = res.data;

        var promises = [];

        if($picture.val() != '') {
            console.log('i need to process the picture upload');
            promises.push(sendFile($picture.get(0).files[0], apiUrl + 'attachments/picture/upload'));
        }

        // no need to see if I have promises, it still resolves if empty
        Promise.all(promises).then(function(results) {
            console.log('back from all promises', results);
            //update cat if we need to
            if(promises.length >= 1) {
                /*
                so we have one or two results, we could add some logic to see what
                we selected so we know what is what, but we can simplify since the result
                contains a 'container' field that matches the property
                */
                results.forEach(function(resultOb) {
                    if(resultOb.data.result.files && resultOb.data.result.files.file[0].container) {
                        team[resultOb.data.result.files.file[0].container] = resultOb.data.result.files.file[0].name;
                    }
                });
                console.dir(team);
                //now update cat, we can't include the id though
                var id = team.id;
                delete team.id;

                $.ajax({
                    method: "POST",
                    url: apiUrl + 'teams/'+id+'/updateUrlPicture',
                    data: team
                })
                .done(function( res ) {
                    getTeams();
                })
                .fail(function(error){
                    console.error(error);
                });
            } else {
                getTeams();
            }
        });
    })
    .fail(function(error){
        console.error(error);
    });
}

//Stolen from: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
function sendFile(file, url) {
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        var fd = new FormData();

        xhr.open("POST", url, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        };
        fd.append('file', file);
        xhr.send(fd);

    });
}