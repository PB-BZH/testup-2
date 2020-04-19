module SKUI
  # @since 1.0.0
  module Enum
    def valid?(value)
      constants.each do |constant|
        return true if const_get(constant) == value
      end
      false
    end
  end # module
end # module
