from plone.app.layout.viewlets.content import DocumentActionsViewlet
from cioppino.twothumbs import rate
from collective.favoriting.browser.favoriting_view import VIEW_NAME
from zope.interface.declarations import implementsOnly
from zope.browser.interfaces import IBrowserView
from collective.rcse.page.controller.comments_view import \
    should_display_comments

CONTENT_VIEWS = (
    'articles_view',
    'discussions_view',
    'event_listing',
    'favorites_view',
    'files_view',
    'images_view',
    'links_view',
    'timeline_view',
    'videos_view',

    'audio_view',
    'discussion_view',
    'document_view',
    'etherpad_view',
    'event_view',
    'link_redirect_view',
    'newsitem_view',
    'image_view',
    'video_view',
)


class DocumentIconActionsViewlet(DocumentActionsViewlet):
    """We replace action by icons if it is set in the registry.
    All actions without icon are put in a popup provided by a [+] icon."""

    def update(self):
        super(DocumentIconActionsViewlet, self).update()
        self.actions = list(self.actions)
        self.actions_icon = []
        for action in self.actions:
            if action['icon']:
                self.actions_icon.append(action)
        for action in self.actions_icon:
            self.actions.remove(action)
        self.rate = rate.getTally(self.context)
        self.fav = self.context.restrictedTraverse(VIEW_NAME)
        self.comments_view = \
            self.context.restrictedTraverse("@@plone.comments")

    def should_display_comments(self):
        return should_display_comments(self.context, self.request)

    def get_how_many(self, action):
        if action["id"] in ("cioppino_twothumbs_like",
                            "cioppino_twothumbs_like_nomore"):
            return self.get_how_many_like()
        if action["id"] in ("cioppino_twothumbs_dislike",
                            "cioppino_twothumbs_dislike_nomore"):
            return self.get_how_many_dislike()
        if action["id"] in ("favoriting_add", "favoriting_rm"):
            return self.get_how_many_star()
        return ""

    def get_how_many_like(self):
        return self.rate["ups"]

    def is_liked_by_be(self):
        return self.rate["mine"] == 1

    def get_how_many_dislike(self):
        return self.rate["downs"]

    def is_disliked_by_be(self):
        return self.rate["mine"] == -1

    def get_how_many_star(self):
        return self.fav.how_many()

    def get_how_many_comments(self):
        return self.comments_view.how_many()

    def should_display(self):
        viewid = self.context_state.view_template_id()
        should_display = viewid in CONTENT_VIEWS
        return should_display


class DocumentActionsView(DocumentIconActionsViewlet):
    """replace the viewlet by a view to easier ajax response"""
    implementsOnly(IBrowserView)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self):
        self.update()
        return self.index()

    def should_display(self):
        return True
