const openCart = (user) => {
    if (user) {
        window.location.replace(`http://127.0.0.1:4000/cart/${user}`)
    } else {
        window.location.replace("http://127.0.0.1:4000/cart/")
    }
}

const openProfile = (user) => {
    if (user) {
        window.location.replace(`http://127.0.0.1:4000/profile/${user}`)
    } else {
        window.location.replace("http://127.0.0.1:4000/login/")
    }
}