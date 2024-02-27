
const state = {
    navDrawer: false,
    app_ready: false,
    app_process: '',
    auth: {
        token: null,
        expires: null,
        profile: null,
    },
    auth_required: false,
    current_user: {
        auth: null,
        profile: null,
        properties: [],
        property: null
    },
    error: {
        show: false,
        message: '',
        retry: () => Promise.resolve(),
        exception: null
    },
    snackbar: {
        status: false,
        text: '', 
        color: 'primary', 
    },
    app_layout: 'full',
    is_mobile: true,
    dashboard: null,
    mode: null,
    system: {},
    notifications: {
        user: [],
        property: [],
        properties: {}
    },
}
export default state;