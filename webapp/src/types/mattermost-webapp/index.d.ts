export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerPopoverUserAttributesComponent(component: React.ElementType)
}
