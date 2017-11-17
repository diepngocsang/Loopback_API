var $code, $name, $picture, $teamList;
var $token = { access_token: ''};

var apiUrl = 'http://localhost:3000/api/';

$(document).ready(function() {

    $('#addTeamForm').on('submit', handleForm);

    $code = $('#code');
    $name = $('#name');
    $picture = $('#picture');
    
    $teamList = $('#teamList');

    loginServer('admin@csc.com', 'admin');

});

function loginServer(email, pass){
    $.post(apiUrl + 'accounts/login', {'email':email,'password':pass}).then(function(res) {
        console.log(res);
        if(res.success){
            $token.access_token = res.data.id;

            console.log($token);
            getTeams();
        }
    });
}

function getTeams() {

    var list = '';

    $.get(apiUrl + 'teams', $token).then(function(res) {
        res.data.forEach(function(team) {
            console.log(team);
            list += `<h2>${team.teamCode}</h2>`;
            if(team.picture) {
                list += `<img src='/api/attachments/picture/download/${team.picture}'>`;
            }
            list += `
            <p>
            ${team.teamCode} is a ${team.teamName}.
            </p>`;
        });
        $teamList.html(list);
    }).catch(function(err){
        console.log(err);
    });
}

function handleForm(e) {
    e.preventDefault();

    var team = {
        access_token: $token.access_token,
        code:$code.val(),
        name:$name.val()
    }

    // step 1 - make the cat, this gives us something to associate with
    $.post(apiUrl + 'teams', team).then(function(res) {

        //copy res since it has the id
        team = res;

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
                    if(resultOb.result.files && resultOb.result.files.file[0].container) {
                        cat[resultOb.result.files.file[0].container] = resultOb.result.files.file[0].name;
                    }
                });
                console.dir(team);
                //now update cat, we can't include the id though
                var id = team.id;
                delete team.id;
                $.post(apiUrl + 'teams/'+id+'/replace', team).then(function() {
                    getTeams();
                });
            } else {
                getTeams();
            }
        });

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