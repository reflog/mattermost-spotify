export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerPopoverUserAttributesComponent(component: React.ElementType)
    registerWebSocketEventHandler(id: string, handler: (data) => void)
    registerChannelHeaderButtonAction(icon: any, action: (c, cm) => void, dropdownText: any, tooltipText: string)
    registerReducer(reducer: any)
    unregisterComponent(componentId)
}
