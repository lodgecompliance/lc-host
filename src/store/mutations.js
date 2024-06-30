
const mutations = {
    SET_APP_STATE: (state, ready) => {
        state.app_ready = ready
    },

    SET_APP_PROCESS: (state, process) => {
        state.app_process = process
    },

    SET_USER_AUTH: (state, auth) => {
        state.current_user.auth = auth
    },

    SET_USER_PROFILE: (state, profile) => {
        state.current_user.profile = profile
    },

    SET_AUTH: (state, auth) => {
        state.auth = auth
    },

    SET_AUTH_PARAM: (state, { key, value }) => {
        state.auth_params[key] = value
    },

    SET_AUTH_REQUIRED: (state, required) => {
        state.auth_required = required
    },

    SET_ACTIVE_PROPERTY: (state, property) => {
        window.localStorage.setItem('property', property.id);
        state.current_user.property = property
    },

    SET_PROPERTIES: (state, properties = []) => {
        state.current_user.properties = properties
    },

    TOAST_ERROR: (state, { show, message, retry, exception }) => {
        state.error = { show, message, retry, exception };
    },
    
    UNSET_CURRENT_USER: (state) => {
        state.current_user = {
            auth: null,
            profile: null,
            property: null
        }
    },

    SNACKBAR(state, settings){
        state.snackbar = settings
    },

    SET_APP_LAYOUT(state, layout) {
        state.app_layout = layout
    },

    SET_MOBILE(state, is_mobile) {
        state.is_mobile = is_mobile;
    },

    SET_DASHBOARD_DATA(state, data) {
        state.dashboard = data
    },

    SET_MODE(state, mode) {
        window.localStorage.setItem('mode', mode);
        state.mode = mode
    },

    SET_PROPERTY_NOTIFICATIONS (state, { id, notifications }) {
        state.notifications.properties[id] = notifications
        if(state.current_user?.property?.id === id){
            state.notifications.property = notifications
        }
    },

    SET_SYSTEM_PARAMS (state, params) {
        state.system = params || {}
    }

}

export default mutations