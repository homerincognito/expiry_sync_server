class SessionsController < Devise::SessionsController
  def new
    super
  end

  def create
    warden.logout(:user)
    self.resource = warden.authenticate!(auth_options)
    set_flash_message(:notice, :signed_in) if is_navigational_format?
    sign_in(resource_name, self.resource)
    respond_with self.resource, location: after_sign_in_path_for(resource) do |format|
      format.html
      format.json { render json: {user: self.resource, status: 'success'} }
    end
  end

  # DELETE /resource/sign_out
  def destroy
    redirect_path = after_sign_out_path_for(resource_name)
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message :notice, :signed_out if signed_out && is_navigational_format?

    # We actually need to hardcode this as Rails default responder doesn't
    # support returning empty response on GET request
    respond_to do |format|
      format.json { render json: {status: 'success'} }
      format.all { head :no_content }
      format.any(*navigational_formats) { redirect_to redirect_path }
    end
  end
end
