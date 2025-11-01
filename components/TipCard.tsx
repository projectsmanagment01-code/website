import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";

export const TipCard: React.FC<any> = ({ title, items, after }) => {
  return (
    <>
      <div className="container border-2 border-solid rounded-lg shadow-sm" style={{ borderColor: '#3F7D58' }}>
        <div className="p-6 border border-dashed" style={{ 
          background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)', 
          borderColor: '#7FAD8A' 
        }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
              background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)'
            }}>
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#2D5A42' }}>{title}</h2>
          </div>
          <div className="px-2">
            <ul className="w-full space-y-3">
              {Array.isArray(items) && items.map((item: any, index: any) => (
                <li
                  key={index}
                  className="flex items-start space-x-3"
                >
                  <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                  <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">
                    {hasHtmlTags(item) ? (
                      <span dangerouslySetInnerHTML={renderSafeHtml(item)} />
                    ) : (
                      item
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {after && (
        <p className="p-6 pl-0 text-gray-800 leading-relaxed text-lg font-medium">
          {hasHtmlTags(after) ? (
            <span dangerouslySetInnerHTML={renderSafeHtml(after)} />
          ) : (
            after
          )}
        </p>
      )}
    </>
  );
};
