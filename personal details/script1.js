document.getElementById('personalDetailsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const aspirations = document.getElementById('aspirations').value;

    const output = document.getElementById('output');
    output.innerHTML = `
        <h2>Submitted Details:</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Aspirations:</strong> ${aspirations}</p>
    `;
});
