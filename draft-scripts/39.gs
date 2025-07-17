function markAllEmailsAsRead() {
  var threads = GmailApp.getInboxThreads();
  for (var i = 0; i < threads.length; i++) {
    threads[i].markRead();
  }
}