import state from "@/store/state";

const getters = {
    auth: state => state.auth,
    auth_required: state => state.auth_required,
    error : state => state.error,
    app_ready: state => state.app_ready,
    app_process: state => state.app_process,
    authenticated: state => !!state.current_user?.auth?.uid,
    profile_loaded: state =>  !!Object.keys(state.current_user.profile || {}).length,
    current_user: state => state.current_user,
    properties: state => state.current_user?.properties || [],
    reservations: state => state.current_user?.reservations || [],
    snackbar: state => state.snackbar,
    app_layout: state => state.app_layout,
    is_mobile: state => state.is_mobile,
    dashboard: state => state.dashboard,
    system: state => state.system || {},
    is_admin: state => !!state.current_user?.profile?.auth?.is_admin,
    mode: state => state.mode,
    checkin_session: state => state.checkin_session,
    checkin_session_checkin: state => state.checkin_session.checkin,
    user_notifications: state => state.notifications.user,
    property_notifications: state => state.notifications.property,
    properties_notifications: state => state.notifications.properties
}

export default getters