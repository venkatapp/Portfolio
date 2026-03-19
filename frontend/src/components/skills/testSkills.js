import React from 'react';
import { useSelector } from 'react-redux';
import '../skills/skills.css';


const CategorizedList = () => {
    const { portfolioData } = useSelector((state) => state.root);
    const { skills } = portfolioData;
    const categoryAItems = skills?.filter(item => item.category === 'Graphic Design');
    const categoryBItems = skills?.filter(item => item.category === 'UIUX');
    const categoryCItems = skills?.filter(item => item.category === 'Ai Tools & Others');

    //gredient color classes 
    const gredientColors=['blue', 'cyan', 'green', 'yellow', 'pink', 'gray', 'orrange'];

    // const gredientClass=gredientColors.map((item)=>(item).split(','))

    // Helper function to render a list of items
const renderItems = (items) => {
    return (
        <div className="card-body">
            <ul className="list-unstyled px-3"> {/* Added list-unstyled to remove bullets */}
                {items?.map((item, index) => {
                    // This picks one color from your array based on the index
                    const barColor = gredientColors[index % gredientColors.length];
                    
                    return (
                        <li key={index} className="mb-3">
                            <div className='d-flex justify-content-between mb-1'>
                                <span className="card-title mb-0">{item.name}</span>
                                <span>{item.percentage}%</span>
                            </div>
                            <div  className="progress" role="progressbar" aria-valuenow={item.percentage} aria-valuemin="0" aria-valuemax="100">
                                <div data-aos="fade-right" data-aos-duration="2000" data-aos-easing="linear"
                                    className={`progress-bar ${barColor}`} 
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

    return (
        <div className='container-fluid skills-bg text-white py-5' id="skills">
            <div className="container py-lg-5 py-md-5">
                <div className='row'>
                    <div className="col-lg-12 col-md-12 text-center mx-auto pb-5">
                        <h1 className="fw-bold text-white" data-aos="fade-up" data-aos-easing="ease-in-sine">Skills & Technologies</h1>
                         <div className="gradient-bar-skills mt-3" data-aos="fade-up" data-aos-easing="ease-in-sine"></div>
                        <p className='mt-4' data-aos="fade-up" data-aos-easing="ease-in-sine">Lorem ipsum dollerset lorem doller sert lorem ipsum doller set</p>
                    </div>
                </div>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                    <div className='col align-items-strech custom-skill-card'>
                        <div className="card h-100 skills-card" data-aos="zoom-in" data-aos-easing="ease-in-sine">
                            <div className="section-a">
                                <h5 className='text-center my-3 mt-4'>Graphic Design</h5>
                                {renderItems(categoryAItems)}
                            </div>
                        </div>
                    </div>
                    <div className='col align-items-strech custom-skill-card'>
                        <div className="card h-100 skills-card" data-aos="zoom-in" data-aos-easing="ease-in-sine">
                            <div className="section-b">
                                <h5 className='text-center my-3 mt-4'>UIUX</h5>
                                {renderItems(categoryBItems)}
                            </div>
                        </div>
                    </div>

                    <div className='col align-items-strech custom-skill-card'>
                        <div className="card h-100 skills-card" data-aos="zoom-in" data-aos-easing="ease-in-sine">
                            <div className="section-c">
                                <h5 className='text-center my-3 mt-4'>AI Tools & Others</h5>
                                {renderItems(categoryCItems)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorizedList;
