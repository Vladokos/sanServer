const openCart = (user) => {
    if (user) {
        window.location.replace(`https://sanserv.onrender.com/cart/${user}`)
    } else {
        window.location.replace("https://sanserv.onrender.com/cart/")
    }
}

const openProfile = (user) => {
    if (user) {
        window.location.replace(`https://sanserv.onrender.com/profile/${user}`)
    } else {
        window.location.replace("https://sanserv.onrender.com/login/")
    }
}