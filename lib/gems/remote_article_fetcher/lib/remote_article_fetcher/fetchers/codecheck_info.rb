require 'remote_article_fetcher/fetcher'
require 'rubygems'
require 'selenium-webdriver'

module RemoteArticleFetcher
  module Fetchers
    class CodecheckInfo < RemoteArticleFetcher::Fetcher
      BASE_URL = "https://www.codecheck.info"

      def self.fetch(data)
        data = data.deep_dup

        url = BASE_URL
        #fetch URL
        Rails.logger.info "Fetching: " + url
        
        # TODO: Switch to chrome headless (phantomjs is deprecated):
        Selenium::WebDriver::PhantomJS.path = 'bin/phantomjs'
        wd = Selenium::WebDriver.for :phantomjs
        wait = Selenium::WebDriver::Wait.new(:timeout => 15)
        wd.get url
        wd.find_element(:id, 'search-query').click
        wd.find_element(:id, 'search-query').send_keys data[:barcode]
        wd.find_element(:id, 'search-submit').click
        
        
        elem = wait.until { wd.find_element(:css => 'div.page-title h1') }
        data[:name] = elem.text.strip
        if data[:name] == "Suchresultate #{data[:barcode]}" # codecheck info acts as if the product exists, returning this dummy name
          wd.quit
          return nil
        end

        data[:images_attributes]= Array.new
        imageNode = wd.find_element(:css, 'div.product-image img')

        
        unless imageNode.nil? or imageNode.attribute("src").nil?
          url = imageNode.attribute("src")
          if url.start_with?('/')
            url = BASE_URL + url
          elsif not url.start_with?('http')
            url = BASE_URL + '/' + url
          end

          data[:images_attributes] << {source_url: url}
        end

        begin
		more_button = wd.find_element(:css => '.product-info-item-list.show-hide div.show-hide-more')
        	more_button.click
	rescue
		# already expanded
	end

        # wait until details are expanded:
        begin
          producer_elem = wait.until do 
            currentElem = wd.find_element(:xpath => "//*/text()[normalize-space(.)='Hersteller / Vertrieb']/../following-sibling::*") 
            return nil if currentElem.text.strip == ''
            currentElem
          end
          data[:producer_attributes] = {name: producer_elem.text.strip}
        rescue
          # just continue, if there are no producer details
        end


        Rails.logger.info "Done fetching"
        wd.quit

        data
      end

      def self.fetch_barcodes(limit = nil)
        ret_arr = Array.new
        # TODO: not yet implemented
        ret_arr
      end
    end
  end
end
