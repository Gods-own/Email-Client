document.addEventListener('DOMContentLoaded', function() {

  let navlinks = document.querySelectorAll('.navigation-link'); 

  // Use buttons to toggle between views in navigation
  // inbox navigation
  document.querySelectorAll('.inbox').forEach((inboxbtn) => {
    inboxbtn.addEventListener('click', () => {
      navlinks.forEach((navlink) => {
        if (navlink.classList.contains('active')) {
          navlink.classList.remove('active')
        }
      })
      inboxbtn.classList.add('active')
      load_mailbox('inbox')
    });
  })
  // sent navigation
  document.querySelectorAll('.sent').forEach((sentbtn) => {
    sentbtn.addEventListener('click', () => {
      navlinks.forEach((navlink) => {
        if (navlink.classList.contains('active')) {
          navlink.classList.remove('active')
        }
      })
      sentbtn.classList.add('active')
      load_mailbox('sent')
    });
  })
  // archived navigation
  document.querySelectorAll('.archived').forEach((archivedbtn) => {
    archivedbtn.addEventListener('click', () => {
      navlinks.forEach((navlink) => {
        if (navlink.classList.contains('active')) {
          navlink.classList.remove('active')
        }
      })
      archivedbtn.classList.add('active')
      load_mailbox('archive')
    });
  })
  // compose navigation
  document.querySelectorAll('.compose').forEach((composebtn) => {
    composebtn.addEventListener('click', () => {
      navlinks.forEach((navlink) => {
        if (navlink.classList.contains('active')) {
          navlink.classList.remove('active')
        }
      })
      composebtn.classList.add('active')
      compose_email()
    });
  })
  // Handling compose form to send mail
  document.querySelector('#compose-form').addEventListener('submit', function(e) {
    e.preventDefault()
    send_email()
  });
  
  numberofmails('inbox');
  numberofmails('sent');
  numberofmails('archive');

  // By default, load the inbox
  load_mailbox('inbox');
});

// function to clear out compostion fields and view compose view and hide other view 
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


// Function to load a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  document.querySelector('#emails-view-body-head').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let i = 0;

  // fetch mailbox
  fetch("/emails/"+mailbox)
  .then(response => response.json())
  .then(email => {
    // ... do something else with email ...
    let emailss = email

    // Get number of mails for each mailbox
    if (mailbox == "inbox") {
      document.querySelector(".number1").innerHTML = emailss.length;
    }
    else if (mailbox == "sent") {
     document.querySelector(".number2").innerHTML = emailss.length;
   }
   else if (mailbox == "archive") {
     document.querySelector(".number3").innerHTML = emailss.length;
   }

    document.querySelector('.tbody').innerHTML = "";
    emailss.forEach(emails => {
      let id = emails.id
      const element = document.createElement('tr');
      element.innerHTML = `
        <td>${emails.sender}</td>
        <td>${emails.subject}</td>
        <td>${emails.timestamp}</td>`;
        element.id = `row${i}`
        document.querySelector('.tbody').append(element);
        isread(id, i);
        element.addEventListener('click', function() {
          // fetch mail to read it
          fetch("/emails/"+id)
          .then(response => response.json())
          .then(email => {
            // Print email
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'none';
            document.querySelector('#read-view').style.display = 'block';
            document.querySelector('#read-view').innerHTML = `<div class="email">
              <h5>Subject: ${email.subject}</h5>
              <p>From: ${email.sender}</p>
              <p>To: ${email.recipients}</p>
              <small class="date">Date: ${email.timestamp}</small>
              <div class="clear"></div>
              <hr>
              <p class="email-body">${email.body}</p>
              <button class="archive">Archive</button>
              <button class="unarchive">Unarchive</button>
              <button class="reply">Reply</button>
            </div>`;
            let navlinks = document.querySelectorAll('.navigation-link'); 
            check_archive(id)

            // add event listener to archive button
            document.querySelector(".archive").addEventListener('click', function() {
              document.querySelector(".archive").style.display = 'none';
              document.querySelector(".unarchive").style.display = 'inline';
              fetch("/emails/"+id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              .then( data => {
                navlinks.forEach((navlink) => {
                  if (navlink.classList.contains('active')) {
                    navlink.classList.remove('active')
                  }
                })
                document.querySelectorAll('.inbox').forEach((inboxbtn) => {
                  inboxbtn.classList.add('active')
                })
                numberofmails('archive')
                load_mailbox('inbox')
              })
            })

             // add event listener to unarchive button
            document.querySelector(".unarchive").addEventListener('click', function() {
              document.querySelector(".unarchive").style.display = 'none';
              document.querySelector(".archive").style.display = 'inline';
              fetch("/emails/"+id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
              .then( data => {
                navlinks.forEach((navlink) => {
                  if (navlink.classList.contains('active')) {
                    navlink.classList.remove('active')
                  }
                })
                document.querySelectorAll('.inbox').forEach((inboxbtn) => {
                  inboxbtn.classList.add('active')
                })
                numberofmails('archive')
                load_mailbox('inbox')
              })
            })

             // add event listener to reply button
            document.querySelector(".reply").addEventListener('click', function() {
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#read-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';
              let subject;
              if (emails.subject.substring(0, 2) == "Re") {
                subject = `${emails.subject}`
              }
              else {
                subject = `Re:${emails.subject}`
              }

              document.querySelector('#compose-recipients').value = emails.sender;
              document.querySelector('#compose-subject').value = `${subject}`;
              document.querySelector('#compose-body').value = `On ${emails.timestamp} ${emails.recipients} wrote: ${emails.body}`;
            });
          });

          fetch("/emails/"+id, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        });
        i++;
    });
  });
};

// function to send mail
function send_email() {
  let recipient = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  let navlinks = document.querySelectorAll('.navigation-link'); 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      if (result.error) {
        document.querySelector('#error-div').style.display = 'block';
        document.querySelector('#message-div').style.display = 'none';
        document.querySelector('.error').innerHTML = result.error;
        setTimeout(function() {
          document.querySelector('#error-div').style.display = 'none';
        } ,2000)
      }
      else {
        document.querySelector('#error-div').style.display = 'none';
        document.querySelector('#message-div').style.display = 'block';
        document.querySelector('.message').innerHTML = result.message;
        setTimeout(function() {
          document.querySelector('#message-div').style.display = 'none';
          navlinks.forEach((navlink) => {
            if (navlink.classList.contains('active')) {
              navlink.classList.remove('active')
            }
          })
          document.querySelectorAll('.sent').forEach((sentbtn) => {
            sentbtn.classList.add('active')
          })
  
          load_mailbox('sent')
        } ,2000)

        compose_email()
      }
        });
}

// function to view mail
function view_email(id) {
  fetch("/emails/"+id)
  .then(response => response.json())
  .then(email => {
    // Print email
    document.querySelector('#emails-view').innerHTML = `<div>
           <h5>${email.sender}</h5>
           <h5>${email.recipients}</h5>
           <p>${email.subject}</p>
           <small>${email.timestamp}</small>
           <p>${email.body}</p>
       </div>`;
});
}

// function to get number of mails in each mailbox
function numberofmails(mailbox) {
  fetch("/emails/"+mailbox)
  .then(response => response.json())
  .then(emails => {
       if (mailbox == "inbox") {
         document.querySelector(".number1").innerHTML = emails.length;
       }
       else if (mailbox == "sent") {
        document.querySelector(".number2").innerHTML = emails.length;
      }
      else if (mailbox == "archive") {
        document.querySelector(".number3").innerHTML = emails.length;
      }
  })
}

// check if email is read
function isread(id, i) {
  fetch("/emails/"+id)
.then(response => response.json())
.then(email => {
  console.log(i)
      if (email.read == true) {
         document.querySelector(`#row${i}`).style.backgroundColor = `#f0f0f0`;
      }
});
}

// check if email is archived
function check_archive(id) {
  fetch("/emails/"+id)
  .then(response => response.json())
  .then(email => {
    if (email.archived == true) {
      document.querySelector('.archive').style.display = 'none';
      document.querySelector('.unarchive').style.display = 'inline';
    }
    else {
      document.querySelector('.unarchive').style.display = 'none';
      document.querySelector('.archive').style.display = 'inline';
    }
  })
}