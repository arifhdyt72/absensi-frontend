export default class MenuService{
    getMenu() {
        if (localStorage.token === undefined) {
            return [
                {
                    label: 'Home',
                    items: [
                        {label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/login'},
                    ]
                }]  
        }
        const base64Url = localStorage.token.split('.')[1];

        if (base64Url === undefined) {
            return [
                {
                    label: 'Home',
                    items: [
                        {label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/login'},
                    ]
                }]
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const user = JSON.parse(jsonPayload);
        if(user === undefined){
            return [
                {
                    label: 'Home',
                    items: [
                        {label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/login'},
                    ]
                }]
        }else{
            if(user.role == "admin"){
                return [
                    {
                        label: 'Dashboard',
                        items: [{
                            label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/'
                        }]
                    },
                    {
                        label: 'Master Data',
                        items: [
                            {label: 'Master Users', icon: 'pi pi-fw pi-user', to: '/users'},
                            {label: 'Attendance Report', icon: 'pi pi-fw pi-database', to: '/report-attendance'},
                        ]
                    },
                    {
                        items: [
                            { label: 'Logout', icon: 'pi pi-fw pi-sign-out', to: '/logout'}
                        ]
                    }
                ]
            }else{
                return [
                    {
                        label: 'Dashboard',
                        items: [{
                            label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/'
                        }]
                    },
                    {
                        label: 'Attendance Data',
                        items: [
                            {label: 'Attendance Report', icon: 'pi pi-fw pi-database', to: '/report-attendance'},
                        ]
                    },
                    {
                        items: [
                            { label: 'Logout', icon: 'pi pi-fw pi-sign-out', to: '/logout'}
                        ]
                    }
                ] 
            }
        }
    }
}