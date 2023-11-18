try {
    const company = await Company.findByUserId(user.UserID);

    console.log(`User ID: ${user.UserID}`);
    console.log(`Company ID: ${company.CompanyID}`);

    // SELECT Jobs FROM Company WHERE Company.CompanyID = compID
    const companyJobs = await Job.findAll({
      where: { CompanyID: company.CompanyID },
    });
    
    //there are jobs
    let message = "";  // Declare the variable outside the if statement

    if (companyJobs.length > 0) {
      console.log('Company Jobs:', companyJobs);
      bot.sendMessage(chatId, "Wahoo!! there are jobs!");
      //print all jobs
      companyJobs.forEach((job) => {
        message += `\nJob ID: ${job.JobID}\nTitle: ${job.JobTitle}\nDescription: ${job.JobDescription}\n\n`;
      });

      //get user to input the jobID, return job where id matches

      

      //retrieve job skill


      //find resumes where skill is mentioned

      //find user who is linked to resume

      //return top 3? users
    } 

    //no jobs 
    else {
      console.log('No jobs found for the company.');
      bot.sendMessage(chatId, "No jobs found for your company :c")
    }
    
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'An error occurred while processing your request.');
  }