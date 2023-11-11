
let fancyLog = () => {
  if (process.env.NODE_ENV === 'production') console.clear(); // may be dangerous

  console.log(`%c

    ██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗
    ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
    ██████╔╝██║   ██║██║     █████╔╝ █████╗     ██║   
    ██╔══██╗██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   
    ██║  ██║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   
    ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   
                                                      
     ██████╗  █████╗ ███╗   ███╗███████╗███████╗      
    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝      
    ██║  ███╗███████║██╔████╔██║█████╗  ███████╗      
    ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║      
    ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║      
     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝      


`, 'font-family: "Courier New";');
};

// edit here: http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=ROCKET%0AGAMES

export default fancyLog;
