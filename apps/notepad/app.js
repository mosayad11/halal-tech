const editor =
    document.getElementById('editor');

const status =
    document.getElementById('status');


const saved =
    localStorage.getItem(
        'so_halal_mode_notepad'
    );


if (saved !== null) {

    editor.value =
        saved;

}


function save() {

    localStorage.setItem(
        'so_halal_mode_notepad',
        editor.value
    );

    status.textContent =
        'Saved';

}


document
    .getElementById('save-button')
    .addEventListener(
        'click',
        save
    );


document
    .getElementById('new-button')
    .addEventListener(
        'click',
        function() {

            editor.value = '';

            status.textContent =
                'New document';

        }
    );


document
    .getElementById('clear-button')
    .addEventListener(
        'click',
        function() {

            editor.value = '';

            save();

        }
    );


editor.addEventListener(
    'input',
    function() {

        status.textContent =
            'Editing...';

    }
);