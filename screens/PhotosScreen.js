function PhotosScreen() {
  const [photos, setPhotos] = React.useState([]);
  const [selectedPhoto, setSelectedPhoto] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Load photos from attended events
    const loadPhotos = () => {
      const attendedEvents = StorageManager.getAttendedEvents() || [];
      const eventPhotos = attendedEvents.map(event => ({
        id: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        photos: event.photos || []
      })).filter(event => event.photos.length > 0);
      
      setPhotos(eventPhotos);
      setLoading(false);
    };

    loadPhotos();
  }, []);

  const handleDownloadPhoto = (photoUrl, eventTitle) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${eventTitle}-photo.jpg`;
    link.click();
  };

  const handleSharePhoto = async (photoUrl, eventTitle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo from ${eventTitle}`,
          text: `Check out this photo from ${eventTitle}!`,
          url: photoUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(photoUrl);
      // Show toast notification
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Photo URL copied to clipboard' } 
      }));
    }
  };

  const PhotoModal = ({ photo, onClose }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <div className="icon-x text-2xl"></div>
        </button>
        
        <img
          src={photo.url}
          alt={photo.eventTitle}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-semibold text-lg mb-2">{photo.eventTitle}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadPhoto(photo.url, photo.eventTitle)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <div className="icon-download text-sm"></div>
              <span className="text-sm">{window.I18n.t('downloadPhoto')}</span>
            </button>
            <button
              onClick={() => handleSharePhoto(photo.url, photo.eventTitle)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <div className="icon-share text-sm"></div>
              <span className="text-sm">{window.I18n.t('sharePhoto')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4" data-name="photos-screen" data-file="screens/PhotosScreen.js">
      {/* Header */}
      <div className="text-center mb-8 slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{window.I18n.t('myEventPhotos')}</h1>
        <p className="text-gray-600 text-lg">Minnen från dina evenemang</p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="icon-camera text-6xl text-gray-400 mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">{window.I18n.t('noPhotos')}</h3>
          <p className="text-gray-500 max-w-md mx-auto">{window.I18n.t('attendEventForPhotos')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {photos.map(event => (
            <div key={event.id} className="card fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.eventTitle}</h3>
                  <p className="text-gray-500 text-sm">{new Date(event.eventDate).toLocaleDateString('sv-SE')}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="icon-camera text-sm"></div>
                  <span className="text-sm">{event.photos.length} foton</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {event.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
                    onClick={() => setSelectedPhoto({ ...photo, eventTitle: event.eventTitle })}
                  >
                    <img
                      src={photo.url}
                      alt={`${event.eventTitle} photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
