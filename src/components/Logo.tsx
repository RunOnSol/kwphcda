import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center">
      <img
        src="http://kwphcda.com.ng/image/logo.jpeg"
        alt="KWPHCDA Logo"
        className="h-12 w-12 rounded-full mr-2"
      />
      {/* <div className="bg-green-600 p-2 rounded-full text-white mr-2">
        <Activity size={24} />
      </div> */}
      <div>
        <span className="font-bold text-green-800 text-xl">KWPHCDA</span>
        <p className="text-xs text-green-700 hidden sm:block">
          Kwara State Primary Health Care Development Agency
        </p>
      </div>
    </div>
  );
};

export default Logo;
