

function onSearchSubmitted(event) {
    event.preventDefault();
    form = event.target;

    const children = form.children;
    
    const urlQuery = new URLSearchParams({
        search: document.getElementById("search-term").value,
        search_by: document.getElementById("search-by").value,
        search_by_major: document.getElementById("search-by-major").value
    });

    window.location.href = `/search?${urlQuery.toString()}`;
}