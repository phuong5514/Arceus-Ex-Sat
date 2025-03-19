

function submitForm(event) {
    event.preventDefault();
    form = event.target;
    const children = form.children;
    
    let searchPath = '/search?';

    for (let i = 0; i < children.length-1; i++) {
        const child = children[i];
        const name = child.getAttribute('name');
        const value = child.value;
        searchPath += `${name}=${value}&`;
    }

    searchPath = searchPath.slice(0, -1)
    console.log(searchPath);
    window.location.href = searchPath;
}