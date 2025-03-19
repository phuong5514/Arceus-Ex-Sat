

function submitForm() {
    form = document.getElementById('search-form');
    form.preventDefault();
    const children = form.children;
    
    let searchPath = '/search?';
    // const search = document.getElementById('search').value;
    // const search_by = document.getElementById('search_by').value;
    // searchPath += `search=${search}&search_by=${search_by}`;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const name = child.getAttribute('name');
        const value = child.value;
        searchPath += `${name}=${value}&`;
    }
    searchPath = searchPath.slice(0, -1);
    console.log(searchPath);
    window.location.href(searchPath);
}