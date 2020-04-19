module SKUI
  # @abstract `Container` and `Window` implements this.
  # @since 1.0.0
  module ControlManager
    # @since 1.0.0
    attr(:controls)

    # @since 1.0.0
    def initialize
      super()
      @controls = []
    end

    # @param [Control] control
    #
    # @return [Boolean] `True` if the webdialog was open and the control added.
    # @since 1.0.0
    def add_control(control)
      unless control.is_a?(Control)
        raise(ArgumentError, "Expected Control")
      end
      if control.parent
        raise(ArgumentError, "Control already has a parent")
      end
      # Add to Ruby DOM tree
      @controls << control
      control.parent = self
      control.window = window
      # Add to Webdialog
      if window&.visible?
        window.bridge.add_control(control)
        if control.is_a?(ControlManager)
          window.bridge.add_container(control)
        end
        return true
      end
      false
    end

    # @param [String] ui_id
    #
    # @return [Control,Nil]
    # @since 1.0.0
    def find_control_by_ui_id(ui_id)
      return self if self.ui_id == ui_id
      @controls.each do |control|
        return control if control.ui_id == ui_id
        if control.is_a?(ControlManager)
          result = control.find_control_by_ui_id(ui_id)
          return result if result
        end
      end
      nil
    end

    # @param [Symbol] name
    #
    # @return [Control,Nil]
    # @since 1.0.0
    def find_control_by_name(name)
      @controls.each do |control|
        return control if control.name == name
        if control.is_a?(ControlManager)
          result = control.find_control_by_name(name)
          return result if result
        end
      end
      nil
    end
    alias [] find_control_by_name

    # @see Control#release
    # @return [Nil]
    # @since 1.0.0
    def release
      @controls.each do |control|
        remove_control(control)
      end
      @controls.clear
      super
    end

    # @param [Control] control
    #
    # @return [Boolean] `True` if the webdialog was open and the control removed.
    # @since 1.0.0
    def remove_control(control)
      raise(ArgumentError, "Expected Control") unless control.is_a?(Control)
      raise(IndexError, "Control not found") unless controls.include?(control)
      @controls.delete(control)
      control_ui_id = control.ui_id
      control.release
      if window&.visible?
        window.bridge.call("UI.remove_control", control_ui_id)
        return true
      end
      false
    end
  end # module
end # module
