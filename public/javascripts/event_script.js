

function onSearchSubmitted(event) {
    event.preventDefault();
    form = event.target;

    const children = form.children;
    
    const urlQuery = new URLSearchParams({
        search: document.getElementById("search-term").value,
        search_by: document.getElementById("search-by").value 
    });

    window.location.href = `/search?${urlQuery.toString()}`;
}