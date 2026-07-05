Feature: Contacts

  As a user of the application
  I want to create contacts
  So that they are saved and visible in my contacts list

  @contacts @regression
  Scenario: Create a new contact and verify it appears in the list
    Given I am on the contacts page
    When I open the create contact form
    And I create a contact with a random name
    Then the contact should appear in the contacts list
